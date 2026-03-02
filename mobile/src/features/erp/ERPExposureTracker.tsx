import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useOcdStore } from "../../state/useOcdStore";
import type { ExposureItem } from "../../types/ocd";

interface Props {
  hierarchyId: string;
}

export const ERPExposureTracker: React.FC<Props> = ({ hierarchyId }) => {
  const items = useOcdStore((state) => state.exposureItems.filter((entry) => entry.hierarchyId === hierarchyId));
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder), [items]);

  const selected = sortedItems.find((entry) => entry.id === selectedItemId);

  const startExposure = (item: ExposureItem) => {
    setSelectedItemId(item.id);
    setTimerSeconds(10 * 60);
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>ERP Exposure Tracker</Text>
      <Text>
        Build hierarchy with drag-and-drop ordering (wire with @shopify/flash-list + react-native-reanimated-dnd in production).
      </Text>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => startExposure(item)}
            style={{
              padding: 14,
              borderWidth: 2,
              borderColor: item.masteryFlag ? "#2e7d32" : "#1f8f84",
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700" }}>{item.title}</Text>
            <Text>Difficulty: {item.difficultyLevel}/10</Text>
            <Text>Subtype: {item.subtype}</Text>
            <Text>{item.masteryFlag ? "Mastered" : "In Progress"}</Text>
          </Pressable>
        )}
      />

      {selected && (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: "#1f8f84" }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{selected.title}</Text>
          <Text>Timer: {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, "0")}</Text>
          <Text>No reassurance. Practice uncertainty and resist compulsions.</Text>
        </View>
      )}
    </View>
  );
};
