'use client';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/ui/Navbar';
import AssignmentForm from '@/components/form/AssignmentForm';
import GeneratingScreen from '@/components/ui/GeneratingScreen';
import OutputPage from '@/components/output/OutputPage';

import { useWebSocket } from '@/hooks/useWebSocket';

export default function HomePage() {
  const { step } = useAppStore();
  const { joinAssignment } = useWebSocket();

  return (
    <>
      <Navbar />
      {step === 'form' && <AssignmentForm onJoin={joinAssignment} />}
      {step === 'generating' && <GeneratingScreen />}
      {step === 'output' && <OutputPage />}
    </>
  );
}
