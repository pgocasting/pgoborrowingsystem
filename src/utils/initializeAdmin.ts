import { createUserAccount, checkUsernameExists } from '@/services/authService'

/**
 * Initialize admin account
 * Username: Admin
 * Password: admin123
 * Email: admin@pgoborrowingsystem.com
 */
export const initializeAdminAccount = async () => {
  try {
    // Check if admin already exists
    const adminExists = await checkUsernameExists('Admin')
    if (adminExists) {
      console.log('Admin account already exists')
      return
    }

    // Create admin account
    const adminProfile = await createUserAccount(
      'Admin',
      'admin@pgoborrowingsystem.com',
      'admin123',
      'admin'
    )

    console.log('Admin account created successfully:', adminProfile)
    return adminProfile
  } catch (error) {
    console.error('Error initializing admin account:', error)
    throw error
  }
}

/**
 * This function should be called once when the app first loads
 * You can call it from App.tsx or main.tsx
 */
export const setupInitialData = async () => {
  try {
    await initializeAdminAccount()
  } catch (error) {
    console.error('Error setting up initial data:', error)
  }
}
