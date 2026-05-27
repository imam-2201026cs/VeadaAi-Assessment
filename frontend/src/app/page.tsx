'use client';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/ui/Navbar';
import AssignmentForm from '@/components/form/AssignmentForm';
import GeneratingScreen from '@/components/ui/GeneratingScreen';
import OutputPage from '@/components/output/OutputPage';

export default function HomePage() {
  const { step } = useAppStore();

  return (
    <>
      <Navbar />
      {step === 'form' && <AssignmentForm />}
      {step === 'generating' && <GeneratingScreen />}
      {step === 'output' && <OutputPage />}
    </>
  );
}
