import React from "react";
import { HomeModal, homeModal } from "./HomeModal";
import { SettingsModal, settingsModal } from "./SettingsModal";
import { ProfileModal, profileModal } from "./ProfileModal";

const MODAL_COMPONENTS = {
  home: HomeModal || homeModal,
  settings: SettingsModal || settingsModal,
  profile: ProfileModal || profileModal,
};

export function ModalManager({ activeModal, onClose }) {
  if (!activeModal) return null;
  const Component = MODAL_COMPONENTS[activeModal];
  if (!Component) return null;
  return <Component isOpen={true} onClose={onClose} />;
}

export default ModalManager;