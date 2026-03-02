import React from "react";
import { Pressable, Text, View } from "react-native";
import type { MindfulnessSessionTemplate } from "../../types/ocd";

const TEMPLATES: MindfulnessSessionTemplate[] = [
  { id: "urge-3", title: "Urge Surfing", type: "urge_surfing", durationMinutes: 3, script: ["Notice urge", "Breathe", "Let urge pass"] },
  { id: "uncertainty-2", title: "Uncertainty Tolerance", type: "uncertainty_tolerance", durationMinutes: 2, script: ["Name uncertainty", "Do not neutralize"] },
  { id: "label-1", title: "Label & Release", type: "label_release", durationMinutes: 1, script: ["Label thought", "Return attention"] },
  { id: "478-4", title: "Breathing 4-7-8", type: "breathing_4_7_8", durationMinutes: 4, script: ["Inhale 4", "Hold 7", "Exhale 8"] },
  { id: "scan-5", title: "Body Scan", type: "body_scan", durationMinutes: 5, script: ["Scan forehead", "Scan chest", "Scan hands"] },
];

export const MindfulnessInterruptions: React.FC = () => {
  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Mindfulness Interruptions</Text>
      <Text>Auto-suggest by time-of-day risk, recent logs, and exposure difficulty.</Text>
      {TEMPLATES.map((template) => (
        <Pressable
          key={template.id}
          style={{ borderWidth: 2, borderColor: "#1f8f84", borderRadius: 12, padding: 12, minHeight: 60 }}
        >
          <Text style={{ fontWeight: "700" }}>{template.title} ({template.durationMinutes} min)</Text>
          <Text>{template.script.join(" • ")}</Text>
        </Pressable>
      ))}
    </View>
  );
};
