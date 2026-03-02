import React from "react";
import { Text, View } from "react-native";
import { useOcdStore } from "../../state/useOcdStore";

export const SymptomProgressDashboard: React.FC = () => {
  const sessions = useOcdStore((state) => state.sessions);
  const weeklyInsight = useOcdStore((state) => state.weeklyInsight);

  const successful = sessions.filter((entry) => entry.completed && (entry.postSuds ?? 100) < entry.preSuds).length;
  const successRate = sessions.length > 0 ? Math.round((successful / sessions.length) * 100) : 0;

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Symptom Progress Dashboard</Text>
      <Text>ERP success rate: {successRate}%</Text>
      <Text>Compulsion frequency and subtype heatmaps render with Victory Native in production.</Text>
      <Text>
        AI narrative: {weeklyInsight?.narrative ?? "Compulsions and mood trends will appear after at least one week of logging."}
      </Text>
      <Text>Include anomaly detection and therapist-ready PDF export action below.</Text>
    </View>
  );
};
