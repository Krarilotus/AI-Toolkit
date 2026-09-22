; Editable configuration is user data. Do not put it in Tauri's generic
; overwrite/delete resource list. Add only missing defaults, even on reinstall.
!ifndef TOOLKIT_DEFAULT_CONFIG_DIR
  !define TOOLKIT_DEFAULT_CONFIG_DIR "${__FILEDIR__}\..\..\config"
!endif

!macro NSIS_HOOK_POSTINSTALL
  SetOutPath "$INSTDIR\config"
  SetOverwrite off
  File /r "${TOOLKIT_DEFAULT_CONFIG_DIR}\*.json"
  SetOverwrite lastused
  SetOutPath "$INSTDIR"
!macroend
