import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the schema for the profile form using Zod
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  backgroundInfo: z.object({
    softwareSkills: z.object({
      python: z.enum(['beginner', 'intermediate', 'advanced']),
      ros: z.enum(['beginner', 'intermediate', 'advanced']),
      javascript: z.enum(['beginner', 'intermediate', 'advanced']),
      typescript: z.enum(['beginner', 'intermediate', 'advanced']),
    }),
    hardwareExperience: z.object({
      jetson: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
      rtx: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
      raspberryPi: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
      arduino: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
    }),
    roboticsExperience: z.enum(['none', 'beginner', 'intermediate', 'advanced']),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const [error, setError] = useState<string | null>(null);

  const pythonLevel = watch('backgroundInfo.softwareSkills.python');
  const rosLevel = watch('backgroundInfo.softwareSkills.ros');
  const jetsonExp = watch('backgroundInfo.hardwareExperience.jetson');

  // Handle form submission
  const onFormSubmit = (data: ProfileFormData) => {
    try {
      onSubmit(data);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Update Your Profile</h2>
      <p className="text-center mb-4">Help us personalize your learning experience</p>

      <form onSubmit={handleSubmit(onFormSubmit)} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <input
            id="name"
            type="text"
            className={`auth-input ${errors.name ? 'border-red-500' : ''}`}
            {...register('name')}
          />
          {errors.name && <div className="auth-error">{errors.name.message}</div>}
        </div>

        <div className="background-info-grid">
          <div>
            <label className="block mb-1">Python Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.softwareSkills.python')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.softwareSkills.python')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.softwareSkills.python')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.softwareSkills?.python && (
              <div className="auth-error">
                {errors.backgroundInfo.softwareSkills.python.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">ROS Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.softwareSkills.ros')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.softwareSkills.ros')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.softwareSkills.ros')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.softwareSkills?.ros && (
              <div className="auth-error">
                {errors.backgroundInfo.softwareSkills.ros.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">JavaScript Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.softwareSkills.javascript')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.softwareSkills.javascript')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.softwareSkills.javascript')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.softwareSkills?.javascript && (
              <div className="auth-error">
                {errors.backgroundInfo.softwareSkills.javascript.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">TypeScript Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.softwareSkills.typescript')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.softwareSkills.typescript')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.softwareSkills.typescript')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.softwareSkills?.typescript && (
              <div className="auth-error">
                {errors.backgroundInfo.softwareSkills.typescript.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Jetson Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="none"
                  {...register('backgroundInfo.hardwareExperience.jetson')}
                /> None
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.hardwareExperience.jetson')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.hardwareExperience.jetson')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.hardwareExperience.jetson')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.hardwareExperience?.jetson && (
              <div className="auth-error">
                {errors.backgroundInfo.hardwareExperience.jetson.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">RTX Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="none"
                  {...register('backgroundInfo.hardwareExperience.rtx')}
                /> None
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.hardwareExperience.rtx')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.hardwareExperience.rtx')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.hardwareExperience.rtx')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.hardwareExperience?.rtx && (
              <div className="auth-error">
                {errors.backgroundInfo.hardwareExperience.rtx.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Raspberry Pi Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="none"
                  {...register('backgroundInfo.hardwareExperience.raspberryPi')}
                /> None
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.hardwareExperience.raspberryPi')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.hardwareExperience.raspberryPi')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.hardwareExperience.raspberryPi')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.hardwareExperience?.raspberryPi && (
              <div className="auth-error">
                {errors.backgroundInfo.hardwareExperience.raspberryPi.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Arduino Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="none"
                  {...register('backgroundInfo.hardwareExperience.arduino')}
                /> None
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.hardwareExperience.arduino')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.hardwareExperience.arduino')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.hardwareExperience.arduino')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.hardwareExperience?.arduino && (
              <div className="auth-error">
                {errors.backgroundInfo.hardwareExperience.arduino.message}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1">Robotics Experience</label>
            <div className="skill-level-selector">
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="none"
                  {...register('backgroundInfo.roboticsExperience')}
                /> None
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="beginner"
                  {...register('backgroundInfo.roboticsExperience')}
                /> Beginner
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="intermediate"
                  {...register('backgroundInfo.roboticsExperience')}
                /> Intermediate
              </label>
              <label className="skill-level-option">
                <input
                  type="radio"
                  value="advanced"
                  {...register('backgroundInfo.roboticsExperience')}
                /> Advanced
              </label>
            </div>
            {errors.backgroundInfo?.roboticsExperience && (
              <div className="auth-error">
                {errors.backgroundInfo.roboticsExperience.message}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="auth-button"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;