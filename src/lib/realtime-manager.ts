import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface RealtimeManagerOptions {
  maxRetries?: number;
  baseRetryDelay?: number;
  maxRetryDelay?: number;
  enablePollingFallback?: boolean;
  pollingInterval?: number;
  healthCheckInterval?: number;
  connectionTimeout?: number;
}

export interface SubscriptionConfig {
  channelName: string;
  event?: string;
  schema?: string;
  table?: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onError?: (error: Error) => void;
}

export class RealtimeManager {
  private client: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionState: ConnectionState = 'disconnected';
  private retryCount = 0;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private options: Required<RealtimeManagerOptions>;
  private listeners: Set<(state: ConnectionState, error?: Error) => void> = new Set();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private connectionMetrics: Map<
    string,
    {
      attempts: number;
      lastSuccess?: Date;
      lastFailure?: Date;
      totalFailures: number;
    }
  > = new Map();

  constructor(options: RealtimeManagerOptions = {}) {
    this.client = supabase;
    this.options = {
      maxRetries: options.maxRetries ?? 5,
      baseRetryDelay: options.baseRetryDelay ?? 1000,
      maxRetryDelay: options.maxRetryDelay ?? 30000,
      enablePollingFallback: options.enablePollingFallback ?? true,
      pollingInterval: options.pollingInterval ?? 30000,
      healthCheckInterval: options.healthCheckInterval ?? 60000,
      connectionTimeout: options.connectionTimeout ?? 10000,
    };

    // Start health monitoring
    this.startHealthMonitoring();
  }

  /**
   * Subscribe to a real-time channel with automatic connection management
   */
  async subscribe(config: SubscriptionConfig): Promise<RealtimeChannel | null> {
    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await this.client.auth.getUser();
      if (authError || !user) {
        const error = new Error('Authentication required for real-time subscriptions');
        this.setConnectionState('error', error);
        config.onError?.(error);
        return null;
      }

      // Remove existing channel if it exists
      await this.unsubscribe(config.channelName);

      // Create new channel
      const channel = this.client.channel(config.channelName);

      // Set up event listeners
      if (config.event && config.schema && config.table) {
        (channel as any).on(
          'postgres_changes',
          {
            event: config.event,
            schema: config.schema,
            table: config.table,
            filter: config.filter,
          },
          (payload: any) => {
            switch (payload.eventType) {
              case 'INSERT':
                config.onInsert?.(payload);
                break;
              case 'UPDATE':
                config.onUpdate?.(payload);
                break;
              case 'DELETE':
                config.onDelete?.(payload);
                break;
            }
          }
        );
      }

      // Subscribe with connection status handling
      const subscriptionResult = channel.subscribe((status) => {
        this.handleSubscriptionStatus(config.channelName, status, config);
      });

      this.channels.set(config.channelName, channel);
      this.setConnectionState('connecting');

      return channel;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to subscribe to channel');
      this.setConnectionState('error', err);
      config.onError?.(err);
      return null;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await this.client.removeChannel(channel);
      this.channels.delete(channelName);
    }

    // Clear retry timeout
    const timeout = this.retryTimeouts.get(channelName);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(channelName);
    }

    // Clear polling fallback
    const pollingInterval = this.pollingIntervals.get(channelName);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      this.pollingIntervals.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    const channelNames = Array.from(this.channels.keys());
    await Promise.all(channelNames.map((name) => this.unsubscribe(name)));
  }

  /**
   * Manually retry connection for a specific channel
   */
  async retryConnection(channelName: string, config: SubscriptionConfig): Promise<void> {
    this.retryCount = 0; // Reset retry count for manual retry
    await this.subscribe(config);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Add connection state listener
   */
  onConnectionStateChange(listener: (state: ConnectionState, error?: Error) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get health status of all connections
   */
  getHealthStatus(): { channelName: string; status: string }[] {
    return Array.from(this.channels.entries()).map(([name, channel]) => ({
      channelName: name,
      status: (channel as any).state || 'unknown',
    }));
  }

  /**
   * Get connection diagnostics
   */
  getDiagnostics(): {
    connectionState: ConnectionState;
    channels: { channelName: string; status: string }[];
    metrics: {
      channelName: string;
      attempts: number;
      lastSuccess?: Date;
      lastFailure?: Date;
      totalFailures: number;
    }[];
  } {
    return {
      connectionState: this.connectionState,
      channels: this.getHealthStatus(),
      metrics: Array.from(this.connectionMetrics.entries()).map(([name, metrics]) => ({
        channelName: name,
        ...metrics,
      })),
    };
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.options.healthCheckInterval);
  }

  /**
   * Perform health check on all channels
   */
  private performHealthCheck(): void {
    const now = new Date();

    for (const [channelName, channel] of this.channels.entries()) {
      const channelState = (channel as any).state;
      const metrics = this.connectionMetrics.get(channelName);

      // Check if channel has been disconnected for too long
      if (channelState === 'closed' || channelState === 'errored') {
        if (metrics?.lastFailure) {
          const timeSinceFailure = now.getTime() - metrics.lastFailure.getTime();

          // If disconnected for more than 5 minutes, attempt reconnection
          if (timeSinceFailure > 5 * 60 * 1000) {
            console.warn(
              `Channel ${channelName} has been disconnected for ${Math.round(timeSinceFailure / 1000)}s, attempting reconnection`
            );
            // Note: We would need the original config to retry, so this is a simplified version
          }
        }
      }
    }
  }

  private handleSubscriptionStatus(
    channelName: string,
    status: string,
    config: SubscriptionConfig
  ): void {
    // Update connection metrics
    const metrics = this.connectionMetrics.get(channelName) || {
      attempts: 0,
      totalFailures: 0,
    };

    switch (status) {
      case 'SUBSCRIBED':
        this.setConnectionState('connected');
        this.retryCount = 0; // Reset retry count on successful connection
        metrics.lastSuccess = new Date();
        this.connectionMetrics.set(channelName, metrics);
        break;

      case 'CHANNEL_ERROR':
        const channelError = new Error(`Failed to connect to channel: ${channelName}`);
        this.setConnectionState('error', channelError);
        metrics.lastFailure = new Date();
        metrics.totalFailures++;
        this.connectionMetrics.set(channelName, metrics);
        this.scheduleRetry(channelName, config);
        break;

      case 'TIMED_OUT':
        const timeoutError = new Error(`Connection to channel ${channelName} timed out`);
        this.setConnectionState('error', timeoutError);
        metrics.lastFailure = new Date();
        metrics.totalFailures++;
        this.connectionMetrics.set(channelName, metrics);
        this.scheduleRetry(channelName, config);
        break;

      case 'CLOSED':
        this.setConnectionState('disconnected');
        metrics.lastFailure = new Date();
        this.connectionMetrics.set(channelName, metrics);
        this.scheduleRetry(channelName, config);
        break;

      default:
        // Handle other statuses as needed
        break;
    }
  }

  private scheduleRetry(channelName: string, config: SubscriptionConfig): void {
    if (this.retryCount >= this.options.maxRetries) {
      const error = new Error(
        `Max retries (${this.options.maxRetries}) exceeded for channel: ${channelName}`
      );
      this.setConnectionState('error', error);

      // Start polling fallback if enabled
      if (this.options.enablePollingFallback) {
        this.startPollingFallback(channelName, config);
      }
      return;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.options.baseRetryDelay * Math.pow(2, this.retryCount),
      this.options.maxRetryDelay
    );

    this.retryCount++;

    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(channelName);
      await this.subscribe(config);
    }, delay);

    this.retryTimeouts.set(channelName, timeout);
  }

  private startPollingFallback(channelName: string, config: SubscriptionConfig): void {
    if (!this.options.enablePollingFallback) return;

    // Clear any existing polling interval
    const existingInterval = this.pollingIntervals.get(channelName);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start polling interval
    const interval = setInterval(() => {
      // This is a basic fallback - in a real implementation,
      // you would call the appropriate API to fetch updates
      // For now, we just notify that we're using polling fallback
      console.warn(`Using polling fallback for channel: ${channelName}`);
    }, this.options.pollingInterval);

    this.pollingIntervals.set(channelName, interval);
  }

  private setConnectionState(state: ConnectionState, error?: Error): void {
    this.connectionState = state;
    this.listeners.forEach((listener) => listener(state, error));
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    // Clear all retry timeouts
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts.clear();

    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();

    // Unsubscribe from all channels
    await this.unsubscribeAll();

    // Clear listeners and metrics
    this.listeners.clear();
    this.connectionMetrics.clear();
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();
