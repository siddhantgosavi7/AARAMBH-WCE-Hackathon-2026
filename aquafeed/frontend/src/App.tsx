import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api/client';
import { Pond, Reading } from './types';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { CreatePondModal } from './components/CreatePondModal';
import { Dashboard } from './pages/Dashboard';
import { PondDetail } from './pages/PondDetail';
import { ScheduleView } from './pages/ScheduleView';
import { AlertsView } from './pages/AlertsView';
import { ReportsView } from './pages/ReportsView';
import { WhatIfSimulator } from './pages/WhatIfSimulator';

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Queries
  const { data: ponds = [] } = useQuery({
    queryKey: ['ponds'],
    queryFn: api.getPonds,
    refetchInterval: 5000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(false),
    refetchInterval: 4000,
  });

  const { data: simStatus } = useQuery({
    queryKey: ['simStatus'],
    queryFn: api.getSimulationStatus,
    refetchInterval: 3000,
  });

  const { data: savingsReport = null } = useQuery({
    queryKey: ['savingsReport'],
    queryFn: api.getSavingsReport,
    refetchInterval: 10000,
  });

  // Fetch latest readings for each pond
  const { data: readingsMap = {} } = useQuery({
    queryKey: ['readingsMap', ponds.map((p) => p.id).join(',')],
    queryFn: async () => {
      const map: Record<number, Reading> = {};
      await Promise.all(
        ponds.map(async (p) => {
          try {
            const list = await api.getPondReadings(p.id, 1);
            if (list.length > 0) {
              map[p.id] = list[list.length - 1];
            }
          } catch {
            // ignore
          }
        })
      );
      return map;
    },
    enabled: ponds.length > 0,
    refetchInterval: 4000,
  });

  // Active selected pond data
  const selectedPond = ponds.find((p) => p.id === selectedPondId) || null;

  const { data: selectedPondReadings = [] } = useQuery({
    queryKey: ['pondReadings', selectedPondId],
    queryFn: () => (selectedPondId ? api.getPondReadings(selectedPondId, 48) : Promise.resolve([])),
    enabled: selectedPondId !== null,
    refetchInterval: 3000,
  });

  const { data: selectedPondFeedPlan = null } = useQuery({
    queryKey: ['feedPlan', selectedPondId],
    queryFn: () => (selectedPondId ? api.getFeedPlan(selectedPondId) : Promise.resolve(null)),
    enabled: selectedPondId !== null,
    refetchInterval: 4000,
  });

  // Cross-pond feed plans map for schedule view
  const { data: plansMap = {} } = useQuery({
    queryKey: ['plansMap', ponds.map((p) => p.id).join(',')],
    queryFn: async () => {
      const map: Record<number, any> = {};
      await Promise.all(
        ponds.map(async (p) => {
          try {
            map[p.id] = await api.getFeedPlan(p.id);
          } catch {
            // ignore
          }
        })
      );
      return map;
    },
    enabled: ponds.length > 0,
    refetchInterval: 5000,
  });

  // Mutations
  const createPondMutation = useMutation({
    mutationFn: api.createPond,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ponds'] });
      showToast('New pond successfully stocked and added to monitoring!');
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: api.resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      showToast('Alert acknowledged and marked resolved.');
    },
  });

  const logMealMutation = useMutation({
    mutationFn: ({
      pondId,
      data,
    }: {
      pondId: number;
      data: any;
    }) => api.postFeedLog(pondId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPlan'] });
      queryClient.invalidateQueries({ queryKey: ['savingsReport'] });
      showToast('Feeding log and appetite feedback recorded successfully!');
    },
  });

  const manualReadingMutation = useMutation({
    mutationFn: (data: any) => api.postReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondReadings'] });
      queryClient.invalidateQueries({ queryKey: ['readingsMap'] });
      queryClient.invalidateQueries({ queryKey: ['feedPlan'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      showToast('Live probe reading ingested! Bioenergetic recalculation triggered.');
    },
  });

  const scenarioMutation = useMutation({
    mutationFn: (scenario: string) => api.startSimulation(scenario),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['simStatus'] });
      showToast(`Simulation switched to ${data.current_scenario?.toUpperCase()}`);
    },
  });

  const manualTickMutation = useMutation({
    mutationFn: api.triggerManualTick,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['readingsMap'] });
      queryClient.invalidateQueries({ queryKey: ['pondReadings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['feedPlan'] });
      showToast(`Generated ${data.readings_created} new sensor telemetry readings!`);
    },
  });

  const uploadCsvMutation = useMutation({
    mutationFn: api.uploadCsv,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['readingsMap'] });
      queryClient.invalidateQueries({ queryKey: ['pondReadings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      showToast(`Successfully imported ${data.imported_readings_count} readings from CSV!`);
    },
    onError: (err: any) => {
      showToast(`CSV Upload Error: ${err.message}`);
    },
  });

  const activeAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-200 text-xs font-semibold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'pond-detail') setSelectedPondId(null);
        }}
        unreadAlertsCount={activeAlerts.length}
        simStatus={simStatus}
        onScenarioChange={(scen) => scenarioMutation.mutate(scen)}
        onManualTick={() => manualTickMutation.mutate()}
        isTicking={manualTickMutation.isPending}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Active Alert Banner on top of all pages */}
        <AlertBanner
          alerts={activeAlerts}
          onResolve={(id) => resolveAlertMutation.mutate(id)}
        />

        {/* Tab Routing */}
        {currentTab === 'dashboard' && (
          <Dashboard
            ponds={ponds}
            readingsMap={readingsMap}
            alerts={alerts}
            onSelectPond={(id) => {
              setSelectedPondId(id);
              setCurrentTab('pond-detail');
            }}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onUploadCsv={(file) => uploadCsvMutation.mutate(file)}
          />
        )}

        {currentTab === 'pond-detail' && selectedPond && (
          <PondDetail
            pond={selectedPond}
            readings={selectedPondReadings}
            feedPlan={selectedPondFeedPlan}
            onBack={() => {
              setCurrentTab('dashboard');
              setSelectedPondId(null);
            }}
            onLogMeal={(mealNum, kg, resp, leftPct) => {
              if (selectedPondId) {
                logMealMutation.mutate({
                  pondId: selectedPondId,
                  data: {
                    meal_number: mealNum,
                    feed_given_kg: kg,
                    feed_response: resp,
                    leftover_pct: leftPct,
                  },
                });
              }
            }}
            onAddManualReading={(reading) => {
              if (selectedPondId) {
                manualReadingMutation.mutate({
                  pond_id: selectedPondId,
                  ...reading,
                });
              }
            }}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            ponds={ponds}
            plansMap={plansMap}
            onSelectPond={(id) => {
              setSelectedPondId(id);
              setCurrentTab('pond-detail');
            }}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            ponds={ponds}
            onResolveAlert={(id) => resolveAlertMutation.mutate(id)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView report={savingsReport} />
        )}

        {currentTab === 'simulator' && (
          <WhatIfSimulator />
        )}
      </main>

      {/* Stock New Pond Modal */}
      <CreatePondModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createPondMutation.mutate(data)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <p>AquaFeed Optimizer • Aligned with UN SDGs 2, 6, 12, 14 • Built for AARAMBH WCE Hackathon 2026</p>
      </footer>
    </div>
  );
};
