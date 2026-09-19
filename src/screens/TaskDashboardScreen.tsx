import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import TaskCard from '../components/TaskCard';

const ITEMS_PER_PAGE = 6;
const AUTO_PAGINATE_INTERVAL = 15000; // 15 seconds

interface TaskDashboardScreenProps {
  onNavigate: (screen: 'Login' | 'Dashboard') => void;
}

const TaskDashboardScreen: React.FC<TaskDashboardScreenProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [immediateTasks, setImmediateTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('tasks/tv');
      const fetchedTasks = response.data?.tasks || response.data || [];
      
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      // We no longer have a separate immediateTasks state, so we clear it.
      // Alternatively, we could remove the immediateTasks state entirely.
      setImmediateTasks([]);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      console.error('Failed URL:', error?.config?.url);
      console.error('Base URL:', error?.config?.baseURL);
      
      const errorMsg = error?.response?.data ? JSON.stringify(error.response.data) : error.message;
      Alert.alert('Error', 'Failed to fetch tasks: ' + errorMsg + '\nURL: ' + error?.config?.url);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Auto pagination logic
    const allTasks = [...immediateTasks, ...tasks];
    const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE);

    if (totalPages === 0) return;

    const intervalId = setInterval(() => {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        if (nextPage >= totalPages) {
          // Refresh data when looping back to first page
          fetchTasks();
          return 0;
        }
        return nextPage;
      });
    }, AUTO_PAGINATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [tasks, immediateTasks]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('tenant_id');
    onNavigate('Login');
  };

  const allTasks = [...immediateTasks, ...tasks];
  const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE);
  
  // Calculate displayed tasks for the current page
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const displayedTasks = allTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Task Dashboard</Text>
          <Text style={styles.subtitle}>
            {allTasks.length} Total | Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          focusable={true}
        >
          {/* Pure React Native Power Icon */}
          <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFFFFF', borderTopColor: 'transparent' }} />
          <View style={{ width: 2, height: 8, backgroundColor: '#FFFFFF', position: 'absolute', top: 8 }} />
        </TouchableOpacity>
      </View>

      {isLoading && tasks.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 3 }]}>Task Info</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Priority</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Status</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'right' }]}>Due Date</Text>
          </View>
          <FlatList
            data={displayedTasks}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={1}
            renderItem={({ item }) => <TaskCard task={item} />}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    padding: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 8,
  },
});

export default TaskDashboardScreen;
