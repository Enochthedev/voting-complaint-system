/**
 * Monitoring Dashboard Component
 *
 * Displays monitoring metrics, alerts, and system health status
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface MonitoringData {
  dashboard: string;
  timeRange: string;
  data: any;
  timestamp: number;
  status: {
    initialized: boolean;
    alertsActive: number;
    dashboardsActive: number;
  };
}

interface AlertData {
  alerts: Array<{
    id: string;
    name: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'acknowledged' | 'resolved';
    timestamp: number;
    metric: string;
    threshold: number;
    currentValue: number;
  }>;
  summary: {
    total: number;
    active: number;
    critical: number;
    warning: number;
    info: number;
  };
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  version: string;
  environment: string;
  monitoring: {
    initialized: boolean;
    alertsActive: number;
    dashboardsActive: number;
  };
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    throughput: number;
  };
}

export function MonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch monitoring data
  const fetchMonitoringData = async (dashboard: string = 'overview', timeRange: string = '1h') => {
    try {
      const response = await fetch(
        `/api/monitoring/dashboard?dashboard=${dashboard}&timeRange=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to fetch monitoring data');
      const data = await response.json();
      setMonitoringData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    }
  };

  // Fetch alert data
  const fetchAlertData = async () => {
    try {
      const response = await fetch('/api/monitoring/alerts');
      if (!response.ok) throw new Error('Failed to fetch alert data');
      const data = await response.json();
      setAlertData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alert data');
    }
  };

  // Fetch health data
  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/monitoring/health');
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMonitoringData(activeTab), fetchAlertData(), fetchHealthData()]);
      setLoading(false);
    };

    loadData();
  }, [activeTab]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMonitoringData(activeTab);
      fetchAlertData();
      fetchHealthData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchMonitoringData(tab);
  };

  // Refresh data manually
  const handleRefresh = () => {
    fetchMonitoringData(activeTab);
    fetchAlertData();
    fetchHealthData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">System health and performance monitoring</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {getStatusIcon(healthData.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{healthData.status}</div>
              <p className="text-xs text-muted-foreground">
                {healthData.environment} • v{healthData.version}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(healthData.metrics.errorRate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Last 5 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthData.metrics.avgResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground">Average P95</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthData.metrics.throughput.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Requests/min</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {alertData && alertData.summary.active > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {alertData.summary.active} active alert(s) - {alertData.summary.critical} critical,{' '}
            {alertData.summary.warning} warning
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {monitoringData ? 'Data loaded' : 'Loading...'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {monitoringData ? 'Data loaded' : 'Loading...'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Performance dashboard content would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Error analysis content would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Real-time monitoring content would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alertData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{alertData.summary.total}</div>
                    <p className="text-xs text-muted-foreground">Total Alerts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {alertData.summary.critical}
                    </div>
                    <p className="text-xs text-muted-foreground">Critical</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {alertData.summary.warning}
                    </div>
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{alertData.summary.info}</div>
                    <p className="text-xs text-muted-foreground">Info</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alertData.alerts.slice(0, 10).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          <div>
                            <div className="font-medium">{alert.name}</div>
                            <div className="text-sm text-muted-foreground">{alert.description}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
