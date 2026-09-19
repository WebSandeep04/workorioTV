import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Task {
  id: number;
  title?: string;
  description?: string;
  task_name?: string;
  task?: string;
  status: any;
  priority: any;
  due_date: string;
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

const getStatusName = (status: any) => {
  if (!status) return 'Unknown';
  if (typeof status === 'string') return status;
  return status.name || 'Unknown';
};

const getPriorityName = (priority: any) => {
  if (!priority) return 'Normal';
  if (typeof priority === 'string') return priority;
  return priority.name || 'Normal';
};

const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  return dateString.split('T')[0];
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const statusName = getStatusName(task.status);
  const priorityName = getPriorityName(task.priority);

  return (
    <TouchableOpacity 
      style={styles.row} 
      onPress={onPress}
      focusable={true}
      activeOpacity={0.8}
    >
      <View style={[styles.cell, { flex: 3 }]}>
        <Text style={styles.title} numberOfLines={1}>{task.title || task.task_name}</Text>
        <Text style={styles.description} numberOfLines={1}>{task.description || task.task}</Text>
      </View>
      
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={[styles.priorityText, getPriorityStyle(priorityName)]}>
          {priorityName}
        </Text>
      </View>
      
      <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
        <View style={[styles.badge, getStatusStyle(statusName)]}>
          <Text style={styles.badgeText}>{statusName}</Text>
        </View>
      </View>
      
      <View style={[styles.cell, { flex: 1, alignItems: 'flex-end' }]}>
        <Text style={styles.dateText}>{formatDate(task.due_date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return { backgroundColor: '#28A745' };
    case 'in-progress': return { backgroundColor: '#FFC107' };
    case 'pending': return { backgroundColor: '#DC3545' };
    default: return { backgroundColor: '#6C757D' };
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high': return { color: '#FF4C4C' };
    case 'medium': return { color: '#FFB84D' };
    case 'low': return { color: '#4DFF4D' };
    default: return { color: '#FFFFFF' };
  }
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#BBBBBB',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TaskCard;
