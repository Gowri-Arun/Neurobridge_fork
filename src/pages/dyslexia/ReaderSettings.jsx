/**
 * Reader Settings Component
 * 
 * Advanced settings panel for adaptive reading engine.
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ReaderSettings = ({ settings, onSettingsChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Reading Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">Text Formatting</TabsTrigger>
              <TabsTrigger value="visual">Visual Aids</TabsTrigger>
              <TabsTrigger value="audio">Audio Support</TabsTrigger>
            </TabsList>

            {/* Text Formatting Tab */}
            <TabsContent value="text" className="space-y-6 mt-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-semibold text-gray-900">
                    Font Size
                  </label>
                  <span className="text-2xl font-bold text-blue-600">
                    {settings.fontSize}%
                  </span>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(val) =>
                    onSettingsChange({ fontSize: val[0] })
                  }
                  min={75}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-2">
                  Increase font size for better readability
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-semibold text-gray-900">
                    Line Spacing
                  </label>
                  <span className="text-2xl font-bold text-blue-600">
                    {settings.lineSpacing.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[settings.lineSpacing * 10]}
                  onValueChange={(val) =>
                    onSettingsChange({ lineSpacing: val[0] / 10 })
                  }
                  min={10}
                  max={40}
                  step={2}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-2">
                  More spacing helps with comprehension
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-semibold text-gray-900">
                    Letter Spacing
                  </label>
                  <span className="text-2xl font-bold text-blue-600">
                    {settings.letterSpacing}px
                  </span>
                </div>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={(val) =>
                    onSettingsChange({ letterSpacing: val[0] })
                  }
                  min={0}
                  max={8}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-2">
                  Better letter distinction reduces confusion
                </div>
              </div>
            </TabsContent>

            {/* Visual Aids Tab */}
            <TabsContent value="visual" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">OpenDyslexic Font</h4>
                  <p className="text-sm text-gray-600">
                    Specially designed font to reduce letter confusion
                  </p>
                </div>
                <Switch
                  checked={settings.enableDyslexicFont}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ enableDyslexicFont: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Highlight Struggling Words</h4>
                  <p className="text-sm text-gray-600">
                    Yellow highlighting for frequently tapped words
                  </p>
                </div>
                <Switch
                  checked={settings.highlightWords?.length > 0}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Slow Down Reading Pace</h4>
                  <p className="text-sm text-gray-600">
                    Adjusts text and TTS speed for careful reading
                  </p>
                </div>
                <Switch
                  checked={settings.slowDownPace}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Reduce Reading Load</h4>
                  <p className="text-sm text-gray-600">
                    Simplifies text presentation
                  </p>
                </div>
                <Switch
                  checked={settings.reduceReadingLoad}
                  disabled
                />
              </div>
            </TabsContent>

            {/* Audio Support Tab */}
            <TabsContent value="audio" className="space-y-6 mt-6">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Text-to-Speech Support</h4>
                  <p className="text-sm text-gray-600">
                    Enable audio reading via Web Speech API
                  </p>
                </div>
                <Switch
                  checked={settings.enableAudioSupport}
                  disabled
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-900">TTS Activations</h4>
                <p className="text-sm text-gray-600">
                  ℹ️ When high TTS usage is detected, the engine suggests reading strategies to reduce audio dependency.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-900">🎯 Reading Tips</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Use TTS as a supplement, not a replacement</li>
                  <li>• Try reading without audio for 5-10 minutes daily</li>
                  <li>• Gradually increase reading duration</li>
                  <li>• Take breaks every 15-20 minutes</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ReaderSettings;
