import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { ERPExposureTracker } from "./features/erp/ERPExposureTracker";
import { ThoughtTriggerJournal } from "./features/journal/ThoughtTriggerJournal";
import { ResponsePreventionGoals } from "./features/goals/ResponsePreventionGoals";
import { MindfulnessInterruptions } from "./features/mindfulness/MindfulnessInterruptions";
import { SymptomProgressDashboard } from "./features/dashboard/SymptomProgressDashboard";
import { ERP_SAFE_COPY } from "./constants/copy";

export const AppShell: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b1020" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ padding: 16 }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>NeuroBridge OCD Self-Management</Text>
          <Text style={{ color: "#cfd8dc", marginTop: 8 }}>{ERP_SAFE_COPY.disclaimer}</Text>
          <Text style={{ color: "#cfd8dc", marginTop: 4 }}>{ERP_SAFE_COPY.noReassuranceNote}</Text>
        </View>

        <ERPExposureTracker hierarchyId="default-hierarchy" />
        <ThoughtTriggerJournal />
        <ResponsePreventionGoals />
        <MindfulnessInterruptions />
        <SymptomProgressDashboard />

        <View style={{ padding: 16 }}>
          <Text style={{ color: "#ffcdd2" }}>{ERP_SAFE_COPY.crisis}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
