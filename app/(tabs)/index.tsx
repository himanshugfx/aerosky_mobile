import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
}) => (
  <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={[styles.cardIconBox, { backgroundColor: color + '15' }]}>
        <FontAwesome name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardCount}>{count}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

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
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.qaIconBox, { backgroundColor: color + '15' }]}>
      <FontAwesome name={icon as any} size={20} color={color} />
    </View>
    <Text style={styles.quickActionTitle}>{title}</Text>
  </TouchableOpacity>
);

// Business Dashboard implementation (Original Dashboard)
const BusinessDashboard = ({
  user,
  drones,
  teamMembers,
  orders,
  batteries,
  onRefresh,
  refreshing,
  calculateCompliance,
  router
}: any) => {
  const complianceScore = calculateCompliance();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Good Day,</Text>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        </View>
      </View>

      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatLabel}>Compliance Score</Text>
          <Text style={[styles.mainStatValue, { color: complianceScore > 80 ? Colors.dark.success : Colors.dark.warning }]}>
            {complianceScore}%
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.mainStat}>
          <Text style={styles.mainStatLabel}>Active Drones</Text>
          <Text style={styles.mainStatValue}>{drones.length}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <Text style={styles.sectionTitle}>Business Overview</Text>
      <View style={styles.cardsGrid}>
        <DashboardCard
          title="Drones"
          count={drones.length}
          icon="fighter-jet"
          color={Colors.dark.primary}
          onPress={() => router.push('/drones')}
        />
        <DashboardCard
          title="Team"
          count={teamMembers.length}
          icon="users"
          color={Colors.dark.success}
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
          color={Colors.dark.warning}
          onPress={() => router.push('/batteries')}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Operations</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction title="Add Drone" icon="plus-circle" onPress={() => router.push('/drones')} />
        <QuickAction title="New Order" icon="file-text" onPress={() => router.push('/orders')} color="#F97316" />
        <QuickAction title="Add Staff" icon="user-plus" onPress={() => router.push('/staff')} color={Colors.dark.success} />
        <QuickAction title="Flights" icon="send" color={Colors.dark.accent} />
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Drones</Text>
        <TouchableOpacity onPress={() => router.push('/drones')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityCard}>
        {drones.length > 0 ? (
          drones.slice(0, 3).map((drone: any, index: number) => (
            <TouchableOpacity
              key={drone.id}
              style={[
                styles.activityItem,
                index < Math.min(drones.length, 3) - 1 && styles.activityItemBorder
              ]}
              onPress={() => router.push(`/drone/${drone.id}`)}
            >
              <View style={[styles.activityIconBox, { backgroundColor: Colors.dark.primary + '15' }]}>
                <FontAwesome name="fighter-jet" size={16} color={Colors.dark.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{drone.modelName}</Text>
                <Text style={styles.activityTime}>
                  Registered {new Date(drone.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </View>

      {/* Compliance Status */}
      <Text style={styles.sectionTitle}>Compliance Status</Text>
      <View style={styles.complianceCard}>
        <View style={styles.complianceHeader}>
          <View style={styles.compInfo}>
            <FontAwesome name="shield" size={18} color={Colors.dark.success} />
            <Text style={styles.complianceTitle}>DGCA Requirements</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>SECURED</Text>
          </View>
        </View>
        <View style={styles.complianceStats}>
          <View style={styles.complianceStat}>
            <Text style={styles.complianceStatValue}>{drones.length}</Text>
            <Text style={styles.complianceStatLabel}>Total UIN</Text>
          </View>
          <View style={styles.complianceDivider} />
          <View style={styles.complianceStat}>
            <Text style={styles.complianceStatValue}>
              {drones.filter((d: any) => (d as any).recurringData?.maintenanceStatus === 'required').length}
            </Text>
            <Text style={styles.complianceStatLabel}>Maintenance</Text>
          </View>
          <View style={styles.complianceDivider} />
          <View style={styles.complianceStat}>
            <Text style={styles.complianceStatValue}>
              {drones.filter((d: any) => !d.accountableManagerId).length}
            </Text>
            <Text style={styles.complianceStatLabel}>Pending</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Super Admin Dashboard implementation
const SuperAdminDashboard = ({ user, refreshing, onRefresh, router }: any) => {
  const [stats, setStats] = React.useState({ organizations: 0, logs: 0 });
  const [loading, setLoading] = React.useState(true);

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Accessing Control Center,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Super Admin'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarMini}>
          <Text style={styles.avatarMiniText}>
            {user?.fullName?.charAt(0).toUpperCase() || 'S'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: Colors.dark.primary }]}>Platform Overview</Text>

      <View style={styles.cardsGrid}>
        <DashboardCard
          title="Organizations"
          count={stats.organizations}
          icon="building"
          color={Colors.dark.primary}
          onPress={() => router.push('/organizations')}
        />
        <DashboardCard
          title="System Logs"
          count={stats.logs}
          icon="file-text-o"
          color={Colors.dark.success}
        />
      </View>

      <Text style={styles.sectionTitle}>Management Shortcuts</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction title="Add Org" icon="plus" onPress={() => router.push('/organizations')} />
        <QuickAction title="View All" icon="list" onPress={() => router.push('/organizations')} color={Colors.dark.primary} />
        <QuickAction title="Audit Logs" icon="shield" color={Colors.dark.success} />
        <QuickAction title="Support" icon="question-circle" onPress={() => router.push('/support')} color={Colors.dark.accent} />
      </View>

      <View style={[styles.complianceCard, { marginTop: Spacing.xl }]}>
        <View style={styles.compInfo}>
          <FontAwesome name="info-circle" size={18} color={Colors.dark.primary} />
          <Text style={styles.complianceTitle}>Platform Health</Text>
        </View>
        <Text style={[styles.emptyText, { marginTop: 12 }]}>
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

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
          calculateCompliance={calculateCompliance}
          router={router}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
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
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.inputBackground,
  },
  avatarMiniText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: Colors.dark.border,
    alignSelf: 'center',
  },
  mainStatLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    marginLeft: 2,
  },
  cardCount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  cardTitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickAction: {
    width: '23%',
    alignItems: 'center',
  },
  qaIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  quickActionTitle: {
    fontSize: 10,
    color: Colors.dark.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  complianceCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  compInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.dark.success,
    letterSpacing: 1,
  },
  complianceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complianceStat: {
    alignItems: 'center',
    flex: 1,
  },
  complianceStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  complianceStatLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  complianceDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.dark.border,
  },
  emptyState: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  }
});
