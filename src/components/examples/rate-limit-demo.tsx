/**
 * Rate Limit Demo Component
 *
 * This component demonstrates the rate limiting functionality
 * by allowing users to test API calls and see rate limits in action.
 *
 * For development/testing purposes only.
 */

'use client';

import { useState } from 'react';
import { getRateLimitStatus, RateLimitError } from '@/lib/rate-limiter';
import { getUserComplaints } from '@/lib/api/complaints';
import { fetchNotifications } from '@/lib/api/notifications';

export function RateLimitDemo() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setLogs((prev) => [`${emoji} [${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const testReadLimit = async () => {
    setIsLoading(true);
    addLog('Testing read operation rate limit...');

    try {
      // This will fail if user is not authenticated, but that's okay for demo
      await getUserComplaints('demo-user-id');
      addLog('Read operation successful', 'success');

      const status = getRateLimitStatus('read');
      addLog(`Remaining read requests: ${status.remaining}/${status.limit}`, 'info');
    } catch (error) {
      if (error instanceof RateLimitError) {
        addLog(`Rate limit exceeded! Retry after ${error.retryAfter} seconds`, 'error');
      } else {
        addLog(
          `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testWriteLimit = async () => {
    setIsLoading(true);
    addLog('Testing write operation rate limit...');

    try {
      // Simulate a write operation
      await new Promise((resolve) => setTimeout(resolve, 100));
      addLog('Write operation successful', 'success');

      const status = getRateLimitStatus('write');
      addLog(`Remaining write requests: ${status.remaining}/${status.limit}`, 'info');
    } catch (error) {
      if (error instanceof RateLimitError) {
        addLog(`Rate limit exceeded! Retry after ${error.retryAfter} seconds`, 'error');
      } else {
        addLog(
          `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testBulkLimit = async () => {
    setIsLoading(true);
    addLog('Testing bulk operation rate limit...');

    try {
      // Simulate a bulk operation
      await new Promise((resolve) => setTimeout(resolve, 100));
      addLog('Bulk operation successful', 'success');

      const status = getRateLimitStatus('bulk');
      addLog(`Remaining bulk requests: ${status.remaining}/${status.limit}`, 'info');
    } catch (error) {
      if (error instanceof RateLimitError) {
        addLog(`Rate limit exceeded! Retry after ${error.retryAfter} seconds`, 'error');
      } else {
        addLog(
          `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'error'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const rapidFire = async () => {
    setIsLoading(true);
    addLog('Starting rapid fire test (10 requests)...');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < 10; i++) {
      try {
        await getUserComplaints('demo-user-id');
        successCount++;
      } catch (error) {
        if (error instanceof RateLimitError) {
          errorCount++;
        }
      }
    }

    addLog(`Rapid fire complete: ${successCount} succeeded, ${errorCount} rate limited`, 'info');
    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-2xl font-bold">Rate Limiting Demo</h2>
        <p className="mb-6 text-muted-foreground">
          Test the rate limiting functionality by clicking the buttons below. Each operation type
          has different rate limits.
        </p>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={testReadLimit}
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Test Read (100/min)
          </button>

          <button
            onClick={testWriteLimit}
            disabled={isLoading}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Test Write (30/min)
          </button>

          <button
            onClick={testBulkLimit}
            disabled={isLoading}
            className="rounded-md bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            Test Bulk (10/min)
          </button>

          <button
            onClick={rapidFire}
            disabled={isLoading}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Rapid Fire Test
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <button
            onClick={clearLogs}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear Logs
          </button>
        </div>

        <div className="h-96 overflow-y-auto rounded-md border border-border bg-muted/50 p-4 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No activity yet. Click a button to test!</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Rate Limit Configuration</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-blue-600">Read Operations</h4>
            <p className="text-sm text-muted-foreground">100 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Fetching complaints, notifications, etc.
            </p>
          </div>

          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-green-600">Write Operations</h4>
            <p className="text-sm text-muted-foreground">30 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">Creating, updating records</p>
          </div>

          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-orange-600">Bulk Operations</h4>
            <p className="text-sm text-muted-foreground">10 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">Bulk assign, status change, etc.</p>
          </div>

          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-purple-600">Auth Operations</h4>
            <p className="text-sm text-muted-foreground">20 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">Login, logout, password reset</p>
          </div>

          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-yellow-600">Search Operations</h4>
            <p className="text-sm text-muted-foreground">50 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">Full-text search queries</p>
          </div>

          <div className="rounded-md border border-border p-4">
            <h4 className="mb-2 font-semibold text-red-600">Upload Operations</h4>
            <p className="text-sm text-muted-foreground">20 requests per minute</p>
            <p className="mt-2 text-xs text-muted-foreground">File uploads to storage</p>
          </div>
        </div>
      </div>
    </div>
  );
}
