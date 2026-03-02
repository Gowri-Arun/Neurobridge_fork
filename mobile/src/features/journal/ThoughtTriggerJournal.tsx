import React, { useMemo } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useOcdStore } from "../../state/useOcdStore";

const QUICK_TYPES = ["obsession", "compulsionUrge", "trigger", "mood"] as const;

export const ThoughtTriggerJournal: React.FC = () => {
  const quickLogThought = useOcdStore((state) => state.quickLogThought);
  const entries = useOcdStore((state) => state.journalEntries);

  const riskByHour = useMemo(() => {
    const count = new Map<number, number>();
    entries.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      count.set(hour, (count.get(hour) ?? 0) + 1);
    });
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [entries]);

  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Thought & Trigger Journal</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {QUICK_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() =>
              quickLogThought({
                id: `${Date.now()}-${type}`,
                timestamp: new Date().toISOString(),
                quickType: type,
                moodEmoji: "😐",
                moodScore: 5,
                urgency: 6,
                triggerTags: [],
                text: `Quick log: ${type}`,
              })
            }
            style={{ minWidth: 120, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: "#1f8f84" }}
          >
            <Text style={{ fontWeight: "700" }}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput placeholder="Voice-to-text transcript lands here" style={{ borderWidth: 2, borderColor: "#999", borderRadius: 10, padding: 12 }} />
      <Text>Attach media/location in production with Expo AV + ImagePicker + Location (consent-gated).</Text>

      <Text style={{ fontWeight: "700" }}>Likely high-risk windows</Text>
      {riskByHour.map(([hour, frequency]) => (
        <Text key={hour}>{hour}:00 — {frequency} logs</Text>
      ))}
    </View>
  );
};
