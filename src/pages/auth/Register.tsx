import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { registerUser, resetRegistration } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';
import Toast from 'react-native-toast-message';

const registerValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Register: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error, isRegistered } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isRegistered) {
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please login to continue',
        position: 'top',
      });
      setTimeout(() => {
        dispatch(resetRegistration());
        navigation.navigate('Login' as never);
      }, 1500);
    }
  }, [isRegistered, navigation]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error,
        position: 'top',
      });
    }
  }, [error]);

  const handleRegister = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    dispatch(registerUser({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password
    }));
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
              }}
              validationSchema={registerValidationSchema}
              onSubmit={handleRegister}>
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.firstName && touched.firstName && styles.inputError,
                      ]}
                      placeholder="First Name"
                      placeholderTextColor={colors.text.secondary}
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.firstName && touched.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.lastName && touched.lastName && styles.inputError,
                      ]}
                      placeholder="Last Name"
                      placeholderTextColor={colors.text.secondary}
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.lastName && touched.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.email && touched.email && styles.inputError,
                      ]}
                      placeholder="Email"
                      placeholderTextColor={colors.text.secondary}
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.email && touched.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        errors.password && touched.password && styles.inputError,
                      ]}
                      placeholder="Password"
                      placeholderTextColor={colors.text.secondary}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                      <Text style={styles.buttonText}>Register</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                      <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.input.background,
    borderWidth: 1,
    borderColor: colors.input.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  linkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },

  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Register;