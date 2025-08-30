import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { WeightTrackingService, WeightEntry } from "../services/weightTrackingService";
import { MealTrackingService, ScheduledMeal } from "../services/mealTrackingService";
import { WorkoutService, ScheduledWorkout } from "../services/workoutService";
import { SessionService } from "../services/sessionService";
import { CoachClientService, CoachClientRelationship } from "../services/coachClientService";
import WeightDisplay from "../components/WeightDisplay";
import { router } from "expo-router";

const MOCK_USER = {
  name: "Maria Rossi",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  online: true,
};

// Mock weight goal (since there's no API for it yet)
const MOCK_WEIGHT_GOAL = {
  targetWeight: 70,
  unit: "kg",
};

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
  const { user } = useAuth();
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(
    null
  );
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [weightLoading, setWeightLoading] = useState(false);
  
  // Real data states for clients
  const [todaysSessions, setTodaysSessions] = useState<any[]>([]);
  const [todaysWorkouts, setTodaysWorkouts] = useState<ScheduledWorkout[]>([]);
  const [todaysMeals, setTodaysMeals] = useState<ScheduledMeal[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Coach-specific data states
  const [clientRelationships, setClientRelationships] = useState<CoachClientRelationship[]>([]);
  const [todaysCoachSessions, setTodaysCoachSessions] = useState<any[]>([]);
  const [coachStats, setCoachStats] = useState({
    totalClients: 0,
    activeClients: 0,
    pendingRequests: 0,
    todaysSessions: 0,
  });
  
  // Accordion state for meals
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch data based on user type
    if (user?.userType === 'Client') {
      fetchLatestWeight();
      fetchTodaysData();
    } else if (user?.userType === 'Coach') {
      fetchCoachData();
    }
  }, [user]);

  const fetchLatestWeight = async () => {
    setWeightLoading(true);
    try {
      const response = await WeightTrackingService.getLatestWeightEntry();
      setLatestWeight(response.weight_entry);
    } catch (error) {
      console.log('No latest weight entry found');
      setLatestWeight(null);
    } finally {
      setWeightLoading(false);
    }
  };

  const fetchTodaysData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Fetch today's sessions
      try {
        const sessionsResponse = await SessionService.getAllSessions({
          limit: 10,
          offset: 0,
          booked: true,
        });
        const todaysSessionsData = sessionsResponse.sessions.filter(session => {
          const sessionDate = new Date(session.startDate).toISOString().split('T')[0];
          return sessionDate === today;
        });
        setTodaysSessions(todaysSessionsData);
      } catch (error) {
        console.log('No sessions found for today');
        setTodaysSessions([]);
      }

      // Fetch today's workouts
      try {
        const workoutsResponse = await WorkoutService.getScheduledWorkouts({
          date_from: today,
          date_to: today,
        });
        setTodaysWorkouts(workoutsResponse.scheduled_workouts);
      } catch (error) {
        console.log('No workouts found for today');
        setTodaysWorkouts([]);
      }

      // Fetch today's meals
      try {
        const mealsResponse = await MealTrackingService.getScheduledMeals({
          date_from: today,
          date_to: today,
        });
        setTodaysMeals(mealsResponse.scheduled_meals);
      } catch (error) {
        console.log('No meals found for today');
        setTodaysMeals([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Fetch client relationships
      try {
        const relationshipsResponse = await CoachClientService.getMyRelationships({});
        setClientRelationships(relationshipsResponse.relationships);
        
        const activeClients = relationshipsResponse.relationships.filter(r => r.status === 'active').length;
        const pendingRequests = relationshipsResponse.relationships.filter(r => r.status === 'pending').length;
        
        setCoachStats(prev => ({
          ...prev,
          totalClients: relationshipsResponse.relationships.length,
          activeClients,
          pendingRequests,
        }));
      } catch (error) {
        console.log('No client relationships found');
        setClientRelationships([]);
      }

      // Fetch today's coach sessions
      try {
        const sessionsResponse = await SessionService.getMySessions({
          limit: 10,
          offset: 0,
        });
        const todaysCoachSessionsData = sessionsResponse.sessions.filter(session => {
          const sessionDate = new Date(session.startDate).toISOString().split('T')[0];
          return sessionDate === today;
        });
        setTodaysCoachSessions(todaysCoachSessionsData);
        
        setCoachStats(prev => ({
          ...prev,
          todaysSessions: todaysCoachSessionsData.length,
        }));
      } catch (error) {
        console.log('No coach sessions found for today');
        setTodaysCoachSessions([]);
      }
    } catch (error) {
      console.error('Error fetching coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeight = () => {
    if (weightLoading) return "Loading...";
    if (!latestWeight) return "Not set";
    return `${latestWeight.weight_value} ${latestWeight.unit}`;
  };

  const getWeightUpdateTime = () => {
    if (!latestWeight) return "No data";
    const date = new Date(latestWeight.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Last Update ${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `Last Update ${diffMinutes}m ago`;
    } else {
      return "Just updated";
    }
  };

  const renderSessionItem = (session: any) => (
    <TouchableOpacity 
      key={session.id} 
      style={styles.sessionItem}
      onPress={() => router.push('/sessions')}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionCoach}>{session.coachFullname}</Text>
        </View>
        <View style={styles.sessionTime}>
          <Text style={styles.sessionTimeText}>
            {new Date(session.startDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <View style={styles.sessionTypeBadge}>
            <Text style={styles.sessionTypeText}>Live Session</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExerciseItem = (workout: ScheduledWorkout) => (
    <TouchableOpacity 
      key={workout.id} 
      style={[styles.exerciseItem, workout.is_completed && styles.exerciseCompleted]}
      onPress={() => router.push('/scheduled-workouts')}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, workout.is_completed && styles.exerciseNameCompleted]}>
          {workout.workout_plan_title}
        </Text>
        <Text style={styles.exerciseDetails}>
          {workout.completed_exercises_count}/{workout.total_exercises} exercises completed
        </Text>
      </View>
      <View style={styles.exerciseStatus}>
        {workout.is_completed ? (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMealItem = (meal: ScheduledMeal) => {
    const isExpanded = expandedMealId === meal.id;
    
    return (
      <View key={meal.id} style={styles.mealItem}>
        <TouchableOpacity 
          style={[styles.mealHeader, meal.is_completed && styles.mealCompleted]}
          onPress={() => setExpandedMealId(isExpanded ? null : meal.id)}
        >
          <View style={styles.mealInfo}>
            <Text style={[styles.mealName, meal.is_completed && styles.mealNameCompleted]}>
              {meal.meal_time_name}
            </Text>
            <Text style={styles.mealDetails}>
              {meal.meal_time_time} • {meal.completion_percentage}% completed
            </Text>
          </View>
          <View style={styles.mealStatus}>
            {meal.is_completed ? (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#ccc" />
            )}
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.mealExpanded}>
            <Text style={styles.mealExpandedText}>
              {meal.consumed_foods_count > 0 
                ? `${meal.consumed_foods_count} food items logged`
                : "No food items logged yet"
              }
            </Text>
            <TouchableOpacity 
              style={styles.logFoodButton}
              onPress={() => router.push('/scheduled-meals')}
            >
              <Text style={styles.logFoodButtonText}>Log Food</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderCoachSessionItem = (session: any) => (
    <TouchableOpacity 
      key={session.id} 
      style={styles.sessionItem}
      onPress={() => router.push('/coach-sessions')}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionCoach}>{session.currentParticipantNumber}/{session.totalParticipantNumber} participants</Text>
        </View>
        <View style={styles.sessionTime}>
          <Text style={styles.sessionTimeText}>
            {new Date(session.startDate).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <View style={styles.sessionTypeBadge}>
            <Text style={styles.sessionTypeText}>{session.goal}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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

        {/* Client Dashboard */}
        {user?.userType === 'Client' && (
          <>
            {/* Weight Display for Clients */}
            <View style={styles.weightSection}>
              <WeightDisplay />
            </View>

            {/* Weight Goal and Current Weight - Only for Clients */}
            <View style={styles.weightGoalSection}>
              <View style={styles.weightGoalCard}>
                <View style={styles.weightGoalRow}>
                  <View style={styles.weightGoalCol}>
                    <Text style={styles.weightGoalLabel}>Target Weight</Text>
                    <Text style={styles.weightGoalValue}>
                      {MOCK_WEIGHT_GOAL.targetWeight} {MOCK_WEIGHT_GOAL.unit}
                    </Text>
                  </View>
                  <View style={styles.weightGoalCol}>
                    <Text style={styles.weightGoalLabel}>Current Weight</Text>
                    <Text style={styles.weightGoalValue}>
                      {getCurrentWeight()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Today's Scheduled Sessions - Only for Clients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="videocam" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Today's Sessions</Text>
                <TouchableOpacity onPress={() => router.push('/sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {loading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="small" color="#A26FFD" />
                    <Text style={styles.loadingText}>Loading sessions...</Text>
                  </View>
                ) : todaysSessions.length > 0 ? (
                  todaysSessions.map(renderSessionItem)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>No sessions today</Text>
                    <Text style={styles.emptySubtext}>Check your schedule for upcoming sessions</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Today's Exercises - Only for Clients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="fitness" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Today's Exercises</Text>
                <TouchableOpacity onPress={() => router.push('/scheduled-workouts')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {loading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="small" color="#A26FFD" />
                    <Text style={styles.loadingText}>Loading workouts...</Text>
                  </View>
                ) : todaysWorkouts.length > 0 ? (
                  todaysWorkouts.map(renderExerciseItem)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="fitness-outline" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>No exercises today</Text>
                    <Text style={styles.emptySubtext}>Check your workout schedule</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Today's Meals - Only for Clients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                <TouchableOpacity onPress={() => router.push('/scheduled-meals')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {loading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="small" color="#A26FFD" />
                    <Text style={styles.loadingText}>Loading meals...</Text>
                  </View>
                ) : todaysMeals.length > 0 ? (
                  todaysMeals.map(renderMealItem)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="restaurant-outline" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>No meals scheduled</Text>
                    <Text style={styles.emptySubtext}>Check your meal plan</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Calorie Tracking Quick Access - Only for Clients */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="nutrition" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Calorie Tracking</Text>
                <TouchableOpacity onPress={() => router.push('/calorie-tracking')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/calorie-tracking')}
                  >
                    <Ionicons name="nutrition" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Daily Log</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/add-food')}
                  >
                    <Ionicons name="add-circle" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Add Food</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/calorie-goals')}
                  >
                                         <Ionicons name="flag" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Goals</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Coach Dashboard */}
        {user?.userType === 'Coach' && (
          <>
            {/* Coach Statistics */}
            <View style={styles.coachStatsSection}>
              <Text style={styles.sectionTitle}>Coach Overview</Text>
              <View style={styles.coachStatsGrid}>
                <View style={styles.coachStatCard}>
                  <Ionicons name="people" size={24} color="#A26FFD" />
                  <Text style={styles.coachStatValue}>{coachStats.totalClients}</Text>
                  <Text style={styles.coachStatLabel}>Total Clients</Text>
                </View>
                <View style={styles.coachStatCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.coachStatValue}>{coachStats.activeClients}</Text>
                  <Text style={styles.coachStatLabel}>Active Clients</Text>
                </View>
                <View style={styles.coachStatCard}>
                  <Ionicons name="time" size={24} color="#FFA726" />
                  <Text style={styles.coachStatValue}>{coachStats.pendingRequests}</Text>
                  <Text style={styles.coachStatLabel}>Pending Requests</Text>
                </View>
                <View style={styles.coachStatCard}>
                  <Ionicons name="videocam" size={24} color="#A26FFD" />
                  <Text style={styles.coachStatValue}>{coachStats.todaysSessions}</Text>
                  <Text style={styles.coachStatLabel}>Today's Sessions</Text>
                </View>
              </View>
            </View>

            {/* Today's Sessions - For Coaches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="videocam" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Today's Sessions</Text>
                <TouchableOpacity onPress={() => router.push('/coach-sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sectionCard}>
                {loading ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="small" color="#A26FFD" />
                    <Text style={styles.loadingText}>Loading sessions...</Text>
                  </View>
                ) : todaysCoachSessions.length > 0 ? (
                  todaysCoachSessions.map(renderCoachSessionItem)
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="videocam-outline" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>No sessions today</Text>
                    <Text style={styles.emptySubtext}>Create a new session to get started</Text>
                    <TouchableOpacity 
                      style={styles.createSessionButton}
                      onPress={() => router.push('/coach-sessions')}
                    >
                      <Text style={styles.createSessionButtonText}>Create Session</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions for Coaches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={20} color="#A26FFD" />
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              <View style={styles.sectionCard}>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/coach-sessions')}
                  >
                    <Ionicons name="add-circle" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Create Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/connections')}
                  >
                    <Ionicons name="people" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Manage Clients</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/workouts')}
                  >
                    <Ionicons name="barbell" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Create Workout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => router.push('/meal-plan')}
                  >
                    <Ionicons name="restaurant" size={24} color="#A26FFD" />
                    <Text style={styles.quickActionText}>Create Meal Plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
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
  weightSection: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  weightGoalSection: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  weightGoalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weightGoalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weightGoalCol: {},
  weightGoalLabel: { color: "#888", fontSize: 14, marginBottom: 2 },
  weightGoalValue: { color: "#1a1a1a", fontWeight: "bold", fontSize: 20 },
  section: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 8,
    flex: 1,
  },
  seeAllText: {
    fontSize: 14,
    color: "#A26FFD",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  sessionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sessionCoach: {
    fontSize: 14,
    color: "#666",
  },
  sessionTime: {
    alignItems: "flex-end",
  },
  sessionTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sessionTypeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionTypeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  exerciseCompleted: {
    opacity: 0.6,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  exerciseNameCompleted: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  exerciseDetails: {
    fontSize: 14,
    color: "#666",
  },
  exerciseStatus: {
    marginLeft: 12,
  },
  mealItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  mealCompleted: {
    opacity: 0.6,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  mealNameCompleted: {
    textDecorationLine: "line-through",
    color: "#666",
  },
  mealDetails: {
    fontSize: 14,
    color: "#666",
  },
  mealStatus: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: 8,
  },
  mealExpanded: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    marginHorizontal: -16,
    marginBottom: -16,
  },
  mealExpandedText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  logFoodButton: {
    backgroundColor: "#A26FFD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  logFoodButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  coachStatsSection: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  coachStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 12,
  },
  coachStatCard: {
    width: "45%", // Adjust as needed for 2 columns
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  coachStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 4,
  },
  coachStatLabel: {
    fontSize: 12,
    color: "#666",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 12,
  },
  quickActionButton: {
    width: "45%", // Adjust as needed for 2 columns
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  quickActionText: {
    fontSize: 14,
    color: "#1a1a1a",
    marginLeft: 8,
    fontWeight: "600",
  },
  createSessionButton: {
    backgroundColor: "#A26FFD",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
  },
  createSessionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
