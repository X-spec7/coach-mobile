import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const MOCK_USER = {
  name: "Maria Rossi",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  online: true,
};

const MOCK_PROGRESS = {
  targetWeight: 50,
  currentWeight: 84,
  unit: "kg",
  progress: 0.52, // 52%
};

const DASHBOARD = [
  {
    key: "calories",
    label: "Calories",
    value: "895 cal",
    sub: "Last Update 8m",
    icon: (
      <MaterialCommunityIcons name="food-apple" size={32} color="#A26FFD" />
    ),
  },
  {
    key: "weight",
    label: "Weight",
    value: "85 kg",
    sub: "Last Update 8m",
    icon: <Feather name="activity" size={32} color="#A26FFD" />,
  },
  {
    key: "water",
    label: "Water",
    value: "800 ml",
    sub: "Last Update 10h",
    icon: <MaterialCommunityIcons name="cup-water" size={32} color="#A26FFD" />,
  },
  {
    key: "workout",
    label: "Workout",
    value: "Activity",
    sub: "Last Update 4d",
    icon: <Ionicons name="walk" size={32} color="#A26FFD" />,
  },
];

const WEATHER_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your key
const DEFAULT_CITY = "London";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HomeScreen() {
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(
    null
  );
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        // Skip weather fetch if no API key is provided
        if (WEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
          setWeather(null);
          setWeatherLoading(false);
          return;
        }
        
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${DEFAULT_CITY}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          icon: data.weather[0].icon,
        });
      } catch (error) {
        console.log('Weather fetch failed:', error);
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.dateWeather}>
            <Text style={styles.dateText}> {formatDate(new Date())} </Text>
            {weatherLoading ? (
              <ActivityIndicator
                size="small"
                color="#A26FFD"
                style={{ marginLeft: 8 }}
              />
            ) : weather ? (
              <View style={styles.weatherRow}>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
                  }}
                  style={styles.weatherIcon}
                />
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.profilePicWrap}>
            <Image
              source={{ uri: MOCK_USER.avatar }}
              style={styles.profilePic}
            />
            {MOCK_USER.online && <View style={styles.onlineDot} />}
          </View>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Hi, {MOCK_USER.name}</Text>

        {/* Weight Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressCol}>
              <Text style={styles.progressLabel}>Target Weight</Text>
              <Text style={styles.progressValue}>
                {MOCK_PROGRESS.targetWeight} {MOCK_PROGRESS.unit}
              </Text>
            </View>
            <View style={styles.progressCol}>
              <Text style={styles.progressLabel}>Current Weight</Text>
              <Text style={styles.progressValue}>
                {MOCK_PROGRESS.currentWeight} {MOCK_PROGRESS.unit}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${MOCK_PROGRESS.progress * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            Your target progress is {Math.round(MOCK_PROGRESS.progress * 100)}%
          </Text>
        </View>

        {/* Dashboard */}
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <View style={styles.dashboardGrid}>
          {DASHBOARD.map((item) => (
            <View key={item.key} style={styles.dashboardCard}>
              {item.icon}
              <Text style={styles.dashboardLabel}>{item.label}</Text>
              <Text style={styles.dashboardValue}>{item.value}</Text>
              <Text style={styles.dashboardSub}>{item.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F6FF" },
  scrollView: { paddingBottom: 100 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 20,
  },
  dateWeather: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 15, color: "#888", fontWeight: "500" },
  weatherRow: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  weatherIcon: { width: 32, height: 32, marginRight: 2 },
  weatherTemp: { fontSize: 16, color: "#A26FFD", fontWeight: "bold" },
  profilePicWrap: { position: "relative" },
  profilePic: { width: 48, height: 48, borderRadius: 24 },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
    borderWidth: 2,
    borderColor: "#fff",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 18,
    marginLeft: 20,
    marginBottom: 8,
  },
  progressCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressCol: {},
  progressLabel: { color: "#888", fontSize: 14, marginBottom: 2 },
  progressValue: { color: "#1a1a1a", fontWeight: "bold", fontSize: 20 },
  progressBarBg: {
    height: 8,
    backgroundColor: "#EDE2FF",
    borderRadius: 4,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#A26FFD",
    borderRadius: 4,
  },
  progressPercent: { color: "#888", fontSize: 14, fontWeight: "500" },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 24,
  },
  dashboardCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  dashboardLabel: { color: "#888", fontSize: 15, marginTop: 8 },
  dashboardValue: {
    color: "#1a1a1a",
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 2,
  },
  dashboardSub: { color: "#bbb", fontSize: 13, marginTop: 2 },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    zIndex: 10,
  },
  navItem: { alignItems: "center", flex: 1 },
  navLabel: { color: "#bbb", fontSize: 12, marginTop: 2 },
  navLabelActive: {
    color: "#A26FFD",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "bold",
  },
  addNewBtn: {
    backgroundColor: "#A26FFD",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#A26FFD",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});
