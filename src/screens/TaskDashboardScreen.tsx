import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import TaskCard from '../components/TaskCard';

const ITEMS_PER_PAGE = 15;
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
      
      const activeTasks = (Array.isArray(fetchedTasks) ? fetchedTasks : []).filter((task: any) => {
        const statusName = task.status?.name || task.status;
        if (typeof statusName === 'string' && statusName.toLowerCase() === 'completed') {
          return false;
        }

        if (task.is_immediate) return true;
        if (!task.due_date || task.due_date === 'N/A') return true;

        const due = new Date(task.due_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isTodayOrPast = due.toDateString() === today.toDateString() || due < today;
        const isTomorrow = due.toDateString() === tomorrow.toDateString();

        return isTodayOrPast || isTomorrow;
      });
      
      setTasks(activeTasks);
      setImmediateTasks([]);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const allTasks = [...immediateTasks, ...tasks];
    const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE);

    if (totalPages === 0) return;

    const intervalId = setInterval(() => {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        if (nextPage >= totalPages) {
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
  
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const displayedTasks = allTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>
            Workorio <Text style={styles.titleAccent}>TV</Text>
          </Text>
        </View>

        <View style={styles.headerCenterContainer}>
          <Text style={styles.subtitle}>
            {allTasks.length} Total | Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
          </Text>
        </View>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity 
            style={styles.syncIconButton} 
            onPress={fetchTasks}
            disabled={isLoading}
            focusable={true}
          >
            <Text style={styles.syncIconText}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            focusable={true}
          >
            <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF', borderTopColor: 'transparent' }} />
            <View style={{ width: 2, height: 6, backgroundColor: '#FFFFFF', position: 'absolute', top: 6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && tasks.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 3 }]}>Task Info</Text>
            <Text style={[styles.headerText, { flex: 1.5 }]}>Customer</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Type</Text>
            <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>Active Days</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  titleAccent: {
    color: '#0066FF',
  },
  subtitle: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    padding: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 4,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncIconButton: {
    backgroundColor: '#0066FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskDashboardScreen;
