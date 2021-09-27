import i18n from "@dhis2/d2-i18n";
import {FlyoutMenu, MenuItem} from "@dhis2/ui";
import PropTypes from "prop-types";
import React from "react";
import {DownloadTypes} from "../../../../../../../core/constants/download";

export default function DownloadMenu({ onClose, onDownload }) {
  return (
    <FlyoutMenu>
      {Object.values(DownloadTypes)?.map((type) => (
        <MenuItem
          dataTest={"data-test=popup-download-menu-list"}
          onClick={() => {
            onDownload(type);
            onClose();
          }}
          key={`${type}-download-menu`}
          label={type}
        />
      ))}
      <MenuItem dataTest={"test-alma-data"} label={"ALMA"}>
        <MenuItem
          dataTest={"test-alma-data-json"}
          label={`${i18n.t("Data")}(JSON)`}
          onClick={() => {
            onDownload("ALMAData");
            onClose();
          }}
        />
        <MenuItem
          dataTest={"test-alma-meta-data"}
          label={i18n.t("Metadata")}
          onClick={() => {
            onDownload("ALMAMeta");
            onClose();
          }}
        />
      </MenuItem>
    </FlyoutMenu>
  );
}

DownloadMenu.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};
