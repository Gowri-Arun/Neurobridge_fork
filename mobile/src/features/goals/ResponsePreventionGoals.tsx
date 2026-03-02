import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useOcdStore } from "../../state/useOcdStore";

export const ResponsePreventionGoals: React.FC = () => {
  const goals = useOcdStore((state) => state.goals);
  const refreshGoals = useOcdStore((state) => state.refreshGoals);

  useEffect(() => {
    refreshGoals();
  }, [refreshGoals]);

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Daily Response Prevention Goals</Text>
      {goals.map((goal) => (
        <View key={goal.id} style={{ borderWidth: 2, borderColor: "#1f8f84", borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>{goal.title}</Text>
          <Text>{goal.rationale}</Text>
          <Text>Success probability: {Math.round(goal.successProbability * 100)}%</Text>
          <Text>Adaptive level: {goal.adaptiveLevel}</Text>
          <Text>{goal.resetCompassionCopy}</Text>
          <Pressable style={{ marginTop: 8, borderWidth: 2, borderColor: "#2e7d32", borderRadius: 10, padding: 10 }}>
            <Text style={{ textAlign: "center", fontWeight: "700" }}>Mark progress</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
};
