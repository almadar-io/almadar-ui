/**
 * Settings Template
 *
 * Main settings page template for the Builder.
 */

import React, { useState } from 'react';
import { Box } from '../../../components/atoms/Box';
import { GitHubIntegration } from '../organisms/GitHubIntegration';

export interface SettingsTemplateProps {
  /** Optional className for styling */
  className?: string;
}

type SettingsTab = 'general' | 'integrations' | 'appearance' | 'advanced';

/**
 * Settings Template
 *
 * Provides a tabbed settings interface for the Builder.
 */
export const SettingsTemplate: React.FC<SettingsTemplateProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ];

  return (
    <Box className={className}>
      {/* Header */}
      <Box className="border-b border-gray-200 bg-white">
        <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your Builder preferences and integrations
          </p>
        </Box>
      </Box>

      {/* Content */}
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Box className="flex gap-8">
          {/* Sidebar Navigation */}
          <Box className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md
                    transition-colors
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </Box>

          {/* Main Content */}
          <Box className="flex-1 min-w-0">
            {activeTab === 'general' && (
              <Box>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                <Box className="space-y-4">
                  <p className="text-sm text-gray-500">General settings coming soon...</p>
                </Box>
              </Box>
            )}

            {activeTab === 'integrations' && (
              <Box>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
                <Box className="space-y-6">
                  {/* GitHub Integration */}
                  <GitHubIntegration />

                  {/* Placeholder for other integrations */}
                  <Box className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-gray-500">
                      More integrations coming soon...
                      <br />
                      (Stripe, Twilio, SendGrid, etc.)
                    </p>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 'appearance' && (
              <Box>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
                <Box className="space-y-4">
                  <p className="text-sm text-gray-500">Theme and appearance settings coming soon...</p>
                </Box>
              </Box>
            )}

            {activeTab === 'advanced' && (
              <Box>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>
                <Box className="space-y-4">
                  <p className="text-sm text-gray-500">Advanced settings coming soon...</p>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

SettingsTemplate.displayName = 'SettingsTemplate';
