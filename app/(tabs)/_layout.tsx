import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../lib/store';

// Custom Drawer Content Component
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const menuItems = [
    { name: 'index', label: 'Dashboard', icon: 'home', roles: ['ALL'] },
    { name: 'organizations', label: 'Organizations', icon: 'building', roles: ['SUPER_ADMIN'] },
    { name: 'drones', label: 'Fleet', icon: 'plane', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'staff', label: 'Personnel', icon: 'users', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'subcontractors', label: 'Partners', icon: 'building', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'inventory', label: 'Inventory', icon: 'archive', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'orders', label: 'Orders', icon: 'list-alt', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'batteries', label: 'Power Units', icon: 'bolt', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'flights', label: 'Flight Logs', icon: 'send', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'accounts', label: 'Accounts', icon: 'credit-card', roles: ['ALL'] },
    { name: 'support', label: 'Assistance', icon: 'question-circle', roles: ['ALL'] },
    { name: 'profile', label: 'Profile', icon: 'user', roles: ['ALL'] },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes('ALL') || (user?.role && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.sidebar }]}>
      {/* Header */}
      <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: 'transparent' }]}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={{ width: 64, height: 64, borderRadius: 16 }}
              resizeMode="contain"
            />
          </View>
        </View>
        {user && (
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '30' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: '#fff' }]} numberOfLines={1}>
                {user.fullName || user.username || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: 'rgba(255,255,255,0.6)' }]} numberOfLines={1}>
                {user.role === 'SUPER_ADMIN' ? 'Platform Administrator' : (user.organizationName || 'Company Admin')}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.menuContainer}>
        {filteredMenuItems.map((item) => {
          const isActive = props.state.routeNames[props.state.index] === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                isActive && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => props.navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              <FontAwesome
                name={item.icon as any}
                size={20}
                color={isActive ? colors.primary : 'rgba(255,255,255,0.7)'}
              />
              <Text style={[
                styles.menuLabel,
                { color: isActive ? colors.primary : '#fff' }
              ]}>
                {item.label}
              </Text>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.drawerFooter, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: colors.textSecondary }]}>v1.0.0</Text>
      </View>
    </View>
  );
}

// Header with Hamburger Menu
function DrawerHeader({ title, navigation, colors }: { title: string; navigation: any; colors: any }) {
  return (
    <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.hamburger}
        onPress={() => navigation.toggleDrawer()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="bars" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );
}

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.cardBackground,
          width: 280,
        },
        headerShown: true,
        header: ({ navigation, route, options }) => (
          <DrawerHeader
            title={options.title || route.name}
            navigation={navigation}
            colors={colors}
          />
        ),
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color }) => <FontAwesome name="home" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="organizations"
        options={{
          title: 'Organization Management',
          drawerLabel: 'Organizations',
          drawerIcon: ({ color }) => <FontAwesome name="building" size={20} color={color} />,
          // Hide from drawer list if not SUPER_ADMIN (already filtered in CustomDrawerContent, but good for safety)
        }}
      />
      <Drawer.Screen
        name="drones"
        options={{
          title: 'Fleet',
          drawerLabel: 'Fleet',
          drawerIcon: ({ color }) => <FontAwesome name="plane" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="staff"
        options={{
          title: 'Personnel',
          drawerLabel: 'Personnel',
          drawerIcon: ({ color }) => <FontAwesome name="users" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="subcontractors"
        options={{
          title: 'Partners',
          drawerLabel: 'Partners',
          drawerIcon: ({ color }) => <FontAwesome name="building" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="inventory"
        options={{
          title: 'Inventory Management',
          drawerLabel: 'Inventory',
          drawerIcon: ({ color }) => <FontAwesome name="archive" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="batteries"
        options={{
          title: 'Power Units',
          drawerLabel: 'Power Units',
          drawerIcon: ({ color }) => <FontAwesome name="bolt" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          title: 'Orders',
          drawerLabel: 'Orders',
          drawerIcon: ({ color }) => <FontAwesome name="list-alt" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="flights"
        options={{
          title: 'Flight Logs',
          drawerLabel: 'Flight Logs',
          drawerIcon: ({ color }) => <FontAwesome name="send" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="accounts"
        options={{
          title: 'Accounts & Reimbursement',
          drawerLabel: 'Accounts',
          drawerIcon: ({ color }) => <FontAwesome name="credit-card" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="support"
        options={{
          title: 'Assistance',
          drawerLabel: 'Assistance',
          drawerIcon: ({ color }) => <FontAwesome name="question-circle" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'My Profile',
          drawerLabel: 'Profile',
          drawerIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  menuContainer: {
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
    position: 'relative',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 4,
    borderRadius: 2,
  },
  drawerFooter: {
    padding: 24,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hamburger: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44,
  },
});
