import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

/**
 * Grammar correction display component
 * @param {Object} props
 * @param {Array} props.corrections - Array of grammar corrections
 * @param {Function} props.onPress - Callback when correction is tapped (optional)
 */
const GrammarHighlight = ({ corrections, onPress }) => {
  const [selectedError, setSelectedError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleErrorPress = (error) => {
    setSelectedError(error);
    setModalVisible(true);
    if (onPress) {
      onPress(error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedError(null);
  };

  // Icon for error type
  const getErrorIcon = (type) => {
    switch (type) {
      case 'verb_conjugation':
        return '🔄';
      case 'article':
        return '📝';
      case 'preposition':
        return '➡️';
      case 'word_choice':
        return '📚';
      case 'word_order':
        return '↔️';
      case 'spelling':
        return '✏️';
      case 'gender':
        return '⚥';
      default:
        return '❗';
    }
  };

  // Readable type name
  const getErrorTypeName = (type) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!corrections || corrections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grammar Notes:</Text>

      {corrections.map((error, index) => (
        <TouchableOpacity
          key={index}
          style={styles.errorCard}
          onPress={() => handleErrorPress(error)}
          activeOpacity={0.7}
        >
          <View style={styles.errorHeader}>
            <Text style={styles.errorIcon}>{getErrorIcon(error.type)}</Text>
            <Text style={styles.errorType}>{getErrorTypeName(error.type)}</Text>
          </View>

          <View style={styles.correctionRow}>
            <Text style={styles.mistake}>{error.mistake}</Text>
            <Text style={styles.arrow}> → </Text>
            <Text style={styles.correction}>{error.correction}</Text>
          </View>

          <Text style={styles.tapHint}>Tap for explanation</Text>
        </TouchableOpacity>
      ))}

      {/* Explanation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            {selectedError && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>{getErrorIcon(selectedError.type)}</Text>
                  <Text style={styles.modalTitle}>{getErrorTypeName(selectedError.type)}</Text>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Incorrect:</Text>
                    <Text style={styles.modalMistake}>{selectedError.mistake}</Text>
                  </View>

                  <Text style={styles.modalArrow}>↓</Text>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Correct:</Text>
                    <Text style={styles.modalCorrection}>{selectedError.correction}</Text>
                  </View>

                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>Why?</Text>
                    <Text style={styles.explanationText}>{selectedError.explanation}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Got it!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  header: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  errorCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
    textTransform: 'capitalize',
  },
  correctionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  mistake: {
    fontSize: 14,
    color: '#DC3545',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: '#666',
  },
  correction: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 11,
    color: '#856404',
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalRow: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalMistake: {
    fontSize: 18,
    color: '#DC3545',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  modalArrow: {
    fontSize: 24,
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 8,
  },
  modalCorrection: {
    fontSize: 18,
    color: '#28A745',
    fontWeight: '700',
  },
  explanationBox: {
    marginTop: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GrammarHighlight;
