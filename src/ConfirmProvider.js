import React, { useState, useCallback, Fragment, useEffect } from "react";
import ConfirmContext from "./ConfirmContext";
import ConfirmationDialog from "./ConfirmationDialog";

const DEFAULT_OPTIONS = {
  title: "Are you sure?",
  description: "",
  content: null,
  confirmationText: "Ok",
  cancellationText: "Cancel",
  dialogProps: {},
  dialogActionsProps: {},
  confirmationButtonProps: {},
  cancellationButtonProps: {},
  titleProps: {},
  contentProps: {},
  allowClose: true,
  confirmationKeywordTextFieldProps: {},
  hideCancelButton: false,
  buttonOrder: ["cancel", "confirm"],
};

const buildOptions = (defaultOptions, options) => {
  const dialogProps = {
    ...(defaultOptions.dialogProps || DEFAULT_OPTIONS.dialogProps),
    ...(options.dialogProps || {}),
  };
  const dialogActionsProps = {
    ...(defaultOptions.dialogActionsProps ||
      DEFAULT_OPTIONS.dialogActionsProps),
    ...(options.dialogActionsProps || {}),
  };
  const confirmationButtonProps = {
    ...(defaultOptions.confirmationButtonProps ||
      DEFAULT_OPTIONS.confirmationButtonProps),
    ...(options.confirmationButtonProps || {}),
  };
  const cancellationButtonProps = {
    ...(defaultOptions.cancellationButtonProps ||
      DEFAULT_OPTIONS.cancellationButtonProps),
    ...(options.cancellationButtonProps || {}),
  };
  const titleProps = {
    ...(defaultOptions.titleProps || DEFAULT_OPTIONS.titleProps),
    ...(options.titleProps || {}),
  };
  const contentProps = {
    ...(defaultOptions.contentProps || DEFAULT_OPTIONS.contentProps),
    ...(options.contentProps || {}),
  };
  const confirmationKeywordTextFieldProps = {
    ...(defaultOptions.confirmationKeywordTextFieldProps ||
      DEFAULT_OPTIONS.confirmationKeywordTextFieldProps),
    ...(options.confirmationKeywordTextFieldProps || {}),
  };

  return {
    ...DEFAULT_OPTIONS,
    ...defaultOptions,
    ...options,
    dialogProps,
    dialogActionsProps,
    confirmationButtonProps,
    cancellationButtonProps,
    titleProps,
    contentProps,
    confirmationKeywordTextFieldProps,
  };
};

let confirmGlobal;

const ConfirmProvider = ({ children, defaultOptions = {} }) => {
  const [options, setOptions] = useState({});
  const [resolveReject, setResolveReject] = useState([]);
  const [loading, setLoading] = useState(false);

  const [resolve, reject] = resolveReject;

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setOptions(options);
      setResolveReject([resolve, reject]);
    });
  }, []);

  const handleClose = useCallback(() => {
    setLoading(false);

    setResolveReject([]);
  }, []);

  const handleCancel = useCallback(() => {
    if (reject) {
      reject();
      handleClose();
    }
  }, [reject, handleClose]);

  const handleConfirm = useCallback(async () => {
    if (!resolve) return;
    try {
      setLoading(true);
      const result = options.onConfirm ? await options.onConfirm() : undefined;
      resolve(result);
      handleClose();
    } catch (error) {
      reject(error);
    } finally {
      setLoading(false);
    }
  }, [resolve, reject]);

  confirmGlobal = confirm;

  return (
    <Fragment>
      <ConfirmContext.Provider value={confirm}>
        {children}
      </ConfirmContext.Provider>
      <ConfirmationDialog
        open={resolveReject.length === 2}
        options={buildOptions(defaultOptions, options)}
        onClose={handleClose}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </Fragment>
  );
};

export default ConfirmProvider;
export { confirmGlobal as confirm };
