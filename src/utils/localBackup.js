// Local Backup Utilities
// Provides local storage backup for critical finance data

const BACKUP_KEY = 'usedshoes_finance_backup';
const BACKUP_VERSION = '1.0.0';

export function createLocalBackup(data) {
  try {
    // Only backup critical finance data to keep storage minimal
    const backupData = {
      version: BACKUP_VERSION,
      timestamp: new Date().toISOString(),
      financeData: {
        partners: data.partners || [],
        withdrawals: data.withdrawals || [],
        cashInjections: data.cashInjections || [],
        cashFlows: data.cashFlows || [],
        metadata: data.metadata || {}
      }
    };

    localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
    console.log('💾 Local backup created successfully');
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to create local backup:', error);
    return false;
  }
}

export function getLocalBackup() {
  try {
    const backupString = localStorage.getItem(BACKUP_KEY);
    if (!backupString) {
      return null;
    }

    const backup = JSON.parse(backupString);

    // Verify backup format
    if (!backup.version || !backup.financeData) {
      console.warn('⚠️ Invalid backup format, ignoring');
      return null;
    }

    console.log(`📂 Local backup found from ${backup.timestamp}`);
    return backup.financeData;
  } catch (error) {
    console.warn('⚠️ Failed to read local backup:', error);
    return null;
  }
}

export function clearLocalBackup() {
  try {
    localStorage.removeItem(BACKUP_KEY);
    console.log('🗑️ Local backup cleared');
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to clear local backup:', error);
    return false;
  }
}

export function hasLocalBackup() {
  try {
    const backupString = localStorage.getItem(BACKUP_KEY);
    return !!backupString;
  } catch (error) {
    return false;
  }
}

export function getBackupAge() {
  try {
    const backup = getLocalBackup();
    if (!backup) return null;

    const backupString = localStorage.getItem(BACKUP_KEY);
    const backupData = JSON.parse(backupString);

    if (!backupData.timestamp) return null;

    const backupTime = new Date(backupData.timestamp);
    const now = new Date();
    const ageMs = now - backupTime;

    return {
      milliseconds: ageMs,
      minutes: Math.floor(ageMs / (1000 * 60)),
      hours: Math.floor(ageMs / (1000 * 60 * 60)),
      days: Math.floor(ageMs / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    return null;
  }
}