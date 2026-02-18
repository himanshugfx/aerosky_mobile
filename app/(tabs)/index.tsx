import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import Colors, { BorderRadius, FontSizes, Spacing } from '../../constants/Colors';
import { apiClient } from '../../lib/api';
import { useAuthStore, useComplianceStore } from '../../lib/store';

// Dashboard card component
const DashboardCard = ({
  title,
  count,
  icon,
  color,
  onPress
}: {
  title: string;
  count: number;
  icon: string;
  color: string;
  onPress?: () => void;
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground, borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.cardIconBox, { backgroundColor: color + '15' }]}>
          <FontAwesome name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardCount, { color: theme.text }]}>{count}</Text>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Quick action button
const QuickAction = ({
  title,
  icon,
  onPress,
  color = Colors.dark.primary
}: {
  title: string;
  icon: string;
  onPress?: () => void;
  color?: string;
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.qaIconBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={[styles.qaIconInner, { backgroundColor: color + '10' }]}>
          <FontAwesome name={icon as any} size={20} color={color} />
        </View>
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Business Dashboard implementation (Original Dashboard)
const BusinessDashboard = ({
  user,
  drones,
  teamMembers,
  orders,
  batteries,
  onRefresh,
  refreshing,
  router
}: any) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Good Day,</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.fullName || 'User'}</Text>
        </View>
        <TouchableOpacity style={[styles.avatarMini, { backgroundColor: theme.primary, borderColor: theme.border }]}>
          <Text style={styles.avatarMiniText}>
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Header Stats */}
      <View style={[styles.headerStats, { backgroundColor: theme.cardBackground, borderColor: theme.border, justifyContent: 'center' }]}>
        <View style={styles.mainStat}>
          <Text style={[styles.mainStatLabel, { color: theme.textSecondary }]}>Active Drones</Text>
          <Text style={[styles.mainStatValue, { color: theme.text }]}>{drones.length}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Overview</Text>
      <View style={styles.cardsGrid}>
        <DashboardCard
          title="Drones"
          count={drones.length}
          icon="fighter-jet"
          color={theme.primary}
          onPress={() => router.push('/drones')}
        />
        <DashboardCard
          title="Team"
          count={teamMembers.length}
          icon="users"
          color={theme.success}
          onPress={() => router.push('/staff')}
        />
        <DashboardCard
          title="Orders"
          count={orders.length}
          icon="shopping-cart"
          color="#F97316"
          onPress={() => router.push('/orders')}
        />
        <DashboardCard
          title="Batteries"
          count={batteries.length}
          icon="bolt"
          color={theme.warning}
          onPress={() => router.push('/batteries')}
        />
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>Operations</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction title="Add Drone" icon="plus-circle" onPress={() => router.push('/drones')} color={theme.primary} />
        <QuickAction title="New Order" icon="file-text" onPress={() => router.push('/orders')} color="#F97316" />
        <QuickAction title="Add Staff" icon="user-plus" onPress={() => router.push('/staff')} color={theme.success} />
        <QuickAction title="Flights" icon="send" onPress={() => router.push('/flights')} color={theme.accent} />
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Drones</Text>
        <TouchableOpacity onPress={() => router.push('/drones')}>
          <Text style={[styles.seeAllText, { color: theme.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.activityCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {drones.length > 0 ? (
          drones.slice(0, 3).map((drone: any, index: number) => (
            <TouchableOpacity
              key={drone.id}
              style={[
                styles.activityItem,
                index < Math.min(drones.length, 3) - 1 && [styles.activityItemBorder, { borderBottomColor: theme.border }]
              ]}
              onPress={() => router.push(`/drone/${drone.id}`)}
              activeOpacity={0.6}
            >
              <View style={[styles.activityIconBox, { backgroundColor: theme.primary + '15' }]}>
                <FontAwesome name="fighter-jet" size={16} color={theme.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>{drone.modelName}</Text>
                <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                  Registered {new Date(drone.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={theme.textSecondary} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Super Admin Dashboard implementation
const SuperAdminDashboard = ({ user, refreshing, onRefresh, router }: any) => {
  const [stats, setStats] = React.useState({ organizations: 0, logs: 0 });
  const [loading, setLoading] = React.useState(true);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/mobile/organizations');
      setStats({
        organizations: response.data.length,
        logs: 0 // Placeholder
      });
    } catch (error) {
      console.error('Failed to fetch platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [refreshing]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Accessing Control Center,</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.fullName || 'Super Admin'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')} style={[styles.avatarMini, { backgroundColor: theme.primary, borderColor: theme.border }]}>
          <Text style={styles.avatarMiniText}>
            {user?.fullName?.charAt(0).toUpperCase() || 'S'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.primary }]}>Platform Overview</Text>

      <View style={styles.cardsGrid}>
        <DashboardCard
          title="Organizations"
          count={stats.organizations}
          icon="building"
          color={theme.primary}
          onPress={() => router.push('/organizations')}
        />
        <DashboardCard
          title="System Logs"
          count={stats.logs}
          icon="file-text-o"
          color={theme.success}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.lg }]}>Management Shortcuts</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction title="Add Org" icon="plus" onPress={() => router.push('/organizations')} color={theme.primary} />
        <QuickAction title="View All" icon="list" onPress={() => router.push('/organizations')} color={theme.primary} />
        <QuickAction title="Audit Logs" icon="shield" color={theme.success} />
        <QuickAction title="Support" icon="question-circle" onPress={() => router.push('/support')} color={theme.accent} />
      </View>

      <View style={[styles.complianceCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, marginTop: Spacing.xl }]}>
        <View style={styles.compInfo}>
          <FontAwesome name="info-circle" size={18} color={theme.primary} />
          <Text style={[styles.complianceTitle, { color: theme.text }]}>Platform Health</Text>
        </View>
        <Text style={[styles.emptyText, { color: theme.textSecondary, marginTop: 12 }]}>
          System is running within normal parameters. Multi-tenancy isolation is active.
        </Text>
      </View>
    </ScrollView>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    drones,
    teamMembers,
    orders,
    batteries,
    loading,
    fetchAll,
    calculateCompliance
  } = useComplianceStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  if (loading && drones.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      {isSuperAdmin ? (
        <SuperAdminDashboard
          user={user}
          refreshing={refreshing}
          onRefresh={onRefresh}
          router={router}
        />
      ) : (
        <BusinessDashboard
          user={user}
          drones={drones}
          teamMembers={teamMembers}
          orders={orders}
          batteries={batteries}
          onRefresh={onRefresh}
          refreshing={refreshing}
          router={router}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 2,
  },
  avatarMini: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarMiniText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
  },
  headerStats: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: 24,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    opacity: 0.3,
  },
  mainStatLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: 4,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    marginLeft: 0,
  },
  cardCount: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
  },
  qaIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    padding: 2,
  },
  qaIconInner: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  activityCard: {
    borderRadius: 24,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
  },
  activityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  complianceCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    marginTop: Spacing.xs,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  compInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  complianceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  complianceStat: {
    alignItems: 'center',
    flex: 1,
  },
  complianceStatValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  complianceStatLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  complianceDivider: {
    width: 1,
    height: 24,
    opacity: 0.3,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
