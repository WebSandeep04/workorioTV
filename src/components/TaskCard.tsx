import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Task {
  id: number | string;
  title?: string;
  description?: string;
  task_name?: string;
  task?: string;
  status: any;
  priority: any;
  due_date: string;
  created_at?: string;
  customer?: { name: string };
  is_immediate?: boolean;
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

const getDaysCount = (createdAt?: string) => {
  if (!createdAt) return 0;
  const diffTime = Math.abs(new Date().getTime() - new Date(createdAt).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const renderDueDate = (dueDate?: string) => {
  if (!dueDate || dueDate === 'N/A') return <Text style={styles.dateText}>N/A</Text>;
  
  const due = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = due.toDateString() === today.toDateString() || due < today;
  const isTomorrow = due.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return (
      <View style={[styles.dateBadge, { backgroundColor: '#DC3545' }]}>
        <Text style={styles.badgeText}>TODAY</Text>
      </View>
    );
  }
  
  if (isTomorrow) {
    return (
      <View style={[styles.dateBadge, { backgroundColor: '#FFC107' }]}>
        <Text style={styles.badgeText}>TOMORROW</Text>
      </View>
    );
  }
  
  return null;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
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
      
      <View style={[styles.cell, { flex: 1.5 }]}>
        <Text style={styles.customerText} numberOfLines={1}>
          {task.customer?.name || 'N/A'}
        </Text>
      </View>

      <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
        <View style={[styles.typeBadge, task.is_immediate ? styles.immediateBadge : styles.assignedBadge]}>
          <Text style={styles.typeBadgeText}>{task.is_immediate ? 'IMMEDIATE' : 'ASSIGNED'}</Text>
        </View>
      </View>

      <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
        <Text style={styles.ageText}>{getDaysCount(task.created_at)}</Text>
      </View>
      
      <View style={[styles.cell, { flex: 1, alignItems: 'flex-end' }]}>
        {renderDueDate(task.due_date)}
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
    flexShrink: 1,
  },
  description: {
    fontSize: 11,
    color: '#BBBBBB',
  },
  customerText: {
    fontSize: 11,
    color: '#88CCFF',
  },
  ageText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  typeBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  immediateBadge: {
    backgroundColor: '#FF4C4C',
  },
  assignedBadge: {
    backgroundColor: '#4D94FF',
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TaskCard;
