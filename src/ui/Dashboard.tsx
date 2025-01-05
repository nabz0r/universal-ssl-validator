import React, { useEffect, useState } from 'react';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Line, Bar, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';

interface DashboardProps {
  refreshInterval?: number; // en millisecondes
}

const Dashboard: React.FC<DashboardProps> = ({ refreshInterval = 30000 }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupération des métriques
        const metricsResponse = await fetch('/api/metrics/overview');
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);

        // Récupération des alertes
        const alertsResponse = await fetch('/api/alerts/active');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);

        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des données');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="p-6 space-y-6">
      {/* Entête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de Bord SSL Validator</h1>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full ${isLoading ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {isLoading ? 'Actualisation...' : 'Mis à jour'}
          </span>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="grid gap-4">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certificats Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.activeCertificates}</p>
            <p className="text-sm text-muted-foreground">
              {metrics?.certificateChange > 0 ? '+' : ''}{metrics?.certificateChange} depuis hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validations / min</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.validationsPerMinute}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temps Moyen Réponse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{metrics?.avgResponseTime}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Santé Système</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{metrics?.systemHealth}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validations sur le temps */}
        <Card>
          <CardHeader>
            <CardTitle>Validations dans le temps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.validationHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution des types de certificats */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Certificats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.certificateTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statut Services */}
      <Card>
        <CardHeader>
          <CardTitle>Statut des Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics?.services?.map((service: any) => (
              <div key={service.name} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${service.status === 'up' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{service.latency}ms</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;