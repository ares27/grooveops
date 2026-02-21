import React, { useState } from "react";
import { eventService } from "../services/api";

const EventStepper = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    djLineup: [],
    status: "draft",
    coordinatorId: "admin_1", // Placeholder
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      await eventService.create(formData);
      alert("Event Created Successfully!");
    } catch (error) {
      console.error("Submit failed", error);
    }
  };

  return (
    <div className="stepper-container">
      <div className="progress-bar">Step {step} of 3</div>

      {step === 1 && (
        <BasicInfoForm
          data={formData}
          setData={setFormData}
          onNext={nextStep}
        />
      )}
      {step === 2 && (
        <LineupForm
          data={formData}
          setData={setFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}
      {step === 3 && (
        <ReviewEvent
          data={formData}
          onSubmit={handleSubmit}
          onBack={prevStep}
        />
      )}
    </div>
  );
};
