import React, { useState, useEffect } from 'react';
import { Activity, ChevronUp, ChevronDown, AlertCircle, Database, Trash2 } from 'lucide-react';
import { subscribeToEvents } from '../utils/tracking';

export default function EventInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'crm'
  const [events, setEvents] = useState([]);
  const [crmStatus, setCrmStatus] = useState({ failureSimulationActive: false, deadLetterQueue: [] });

  useEffect(() => {
    // Subscribe to tracking events
    const unsubscribe = subscribeToEvents((eventData) => {
      setEvents(prev => [
        {
          id: 'evt_' + Date.now() + Math.random().toString(36).substr(2, 4),
          time: new Date().toLocaleTimeString(),
          ...eventData
        },
        ...prev.slice(0, 49) // Keep last 50 events
      ]);
    });

    return () => unsubscribe();
  }, []);

  // Periodically fetch CRM status and dead-letter queue
  useEffect(() => {
    const fetchCrm = async () => {
      try {
        const res = await fetch('/api/crm/status');
        if (res.ok) {
          const data = await res.json();
          setCrmStatus(data);
        }
      } catch {
        // quiet fallback
      }
    };

    fetchCrm();
    const interval = setInterval(fetchCrm, 4000);
    return () => clearInterval(interval);
  }, []);

  const clearEvents = () => setEvents([]);

  return (
    <aside 
      className={`event-inspector-hud ${isOpen ? 'inspector-open' : 'inspector-collapsed'}`}
      aria-label="Marketing Tracking & CRM Event Inspector"
    >
{/* HUD Header Bar (keyboard-accessible toggle) */}
      <div
        className="inspector-header"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls="inspector-body"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="inspector-title-wrap">
          <div className="pulse-indicator" aria-hidden="true" />
          <Activity size={16} className="text-accent" aria-hidden="true" />
          <span className="inspector-title">Tracking & CRM Inspector</span>
          <span className="event-count-badge" aria-live="polite">{events.length}</span>
        </div>

        <div className="inspector-header-controls">
          <span className="hud-status-chip">GTM & Meta Active</span>
          <span className="hud-toggle-icon" aria-hidden="true">
            {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </span>
        </div>
      </div>

      {/* HUD Expanded Body */}
      {isOpen && (
        <div id="inspector-body" className="inspector-body">
          {/* Tabs */}
          <div className="inspector-tabs">
            <button 
              type="button" 
              className={`inspector-tab ${activeTab === 'events' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span>Marketing Events ({events.length})</span>
            </button>
            <button 
              type="button" 
              className={`inspector-tab ${activeTab === 'crm' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('crm')}
            >
              <span>HubSpot CRM ({crmStatus.deadLetterQueue?.length || 0} failed)</span>
            </button>
            {activeTab === 'events' && events.length > 0 && (
              <button 
                type="button" 
                className="clear-events-btn"
                onClick={clearEvents}
                title="Clear event history"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Tab 1: Live Events Stream */}
          {activeTab === 'events' && (
            <div className="inspector-content-scroll">
              {events.length === 0 ? (
                <div className="inspector-empty-state">
                  <Activity size={24} className="text-muted" />
                  <p>No events recorded yet.</p>
                  <span>Interact with CTAs, navigation, or the lead form to watch live dataLayer & Meta Pixel events.</span>
                </div>
              ) : (
                <div className="events-timeline">
                  {events.map((evt) => {
                    const isSuccess = evt.type.includes('lead_generated');
                    const isFailure = evt.type.includes('failure');
                    const isStart = evt.type.includes('form_started');

                    return (
                      <div 
                        key={evt.id} 
                        className={`event-row-card ${isSuccess ? 'event-card-success' : isFailure ? 'event-card-failure' : ''}`}
                      >
                        <div className="event-row-top">
                          <div className="event-badge-group">
                            <span className={`event-type-badge ${isSuccess ? 'badge-success' : isFailure ? 'badge-error' : isStart ? 'badge-start' : 'badge-neutral'}`}>
                              {evt.type}
                            </span>
                            <span className="event-source-tag">{evt.source}</span>
                          </div>
                          <span className="event-time font-mono">{evt.time}</span>
                        </div>

                        {/* Event Payload JSON */}
                        <div className="event-payload-box">
                          <pre>{JSON.stringify(evt.payload, null, 2)}</pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: HubSpot CRM Architecture View */}
          {activeTab === 'crm' && (
            <div className="inspector-content-scroll">
              <div className="crm-architecture-panel">
                <div className="crm-status-card">
                  <div className="crm-status-header">
                    <Database size={16} className="text-accent" />
                    <strong>HubSpot CRM Mock Service</strong>
                  </div>
                  <p className="crm-status-desc">
                    Protects credentials using server-side execution. Retries up to 3 times with exponential backoff on transient network faults before filing to the Dead-Letter Queue.
                  </p>
                  <div className="crm-stat-chips">
                    <span className={`status-pill ${crmStatus.failureSimulationActive ? 'pill-warning' : 'pill-success'}`}>
                      Mode: {crmStatus.failureSimulationActive ? 'Simulating Rate Limit (429)' : 'Healthy / Live Sync'}
                    </span>
                    <span className="status-pill pill-neutral">
                      Dead-Letter Items: {crmStatus.deadLetterQueue?.length || 0}
                    </span>
                  </div>
                </div>

                {crmStatus.deadLetterQueue && crmStatus.deadLetterQueue.length > 0 && (
                  <div className="dead-letter-list">
                    <h5 className="dlq-heading">
                      <AlertCircle size={14} className="text-error" />
                      <span>Dead-Letter Queue (Failed CRM Requests)</span>
                    </h5>
                    {crmStatus.deadLetterQueue.map((item, idx) => (
                      <div key={idx} className="dlq-item">
                        <div className="dlq-item-top">
                          <strong>{item.company} ({item.email})</strong>
                          <span className="font-mono text-muted">{new Date(item.failedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="dlq-error-text">Error: {item.error}</div>
                        <div className="dlq-retries">Retries Exhausted: {item.retriesExhausted}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
