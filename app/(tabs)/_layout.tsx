import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    { name: 'drones', label: 'Drones', icon: 'plane', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'staff', label: 'Team Members', icon: 'users', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'subcontractors', label: 'Subcontractors', icon: 'building', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'inventory', label: 'Inventory', icon: 'archive', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'batteries', label: 'Batteries', icon: 'bolt', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'orders', label: 'Orders', icon: 'list-alt', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
    { name: 'flights', label: 'Flights', icon: 'send', roles: ['ADMIN', 'OPERATIONS_MANAGER', 'QA_MANAGER', 'PILOT', 'TECHNICIAN', 'VIEWER'] },
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
    <View style={[styles.drawerContainer, { backgroundColor: colors.cardBackground }]}>
      {/* Header */}
      <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <FontAwesome name="plane" size={24} color="#fff" />
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>AeroSky</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>Drone Compliance</Text>
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
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user.fullName || user.username || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
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
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text style={[
                styles.menuLabel,
                { color: isActive ? colors.primary : colors.text }
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
          title: 'My Drones',
          drawerLabel: 'Drones',
          drawerIcon: ({ color }) => <FontAwesome name="plane" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="staff"
        options={{
          title: 'Team Members',
          drawerLabel: 'Staff',
          drawerIcon: ({ color }) => <FontAwesome name="users" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="subcontractors"
        options={{
          title: 'Subcontractors',
          drawerLabel: 'Subcontractors',
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
          title: 'Battery Inventory',
          drawerLabel: 'Batteries',
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
          drawerLabel: 'Flights',
          drawerIcon: ({ color }) => <FontAwesome name="send" size={20} color={color} />,
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  menuContainer: {
    paddingTop: 10,
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
    fontWeight: '500',
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 2,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
});
