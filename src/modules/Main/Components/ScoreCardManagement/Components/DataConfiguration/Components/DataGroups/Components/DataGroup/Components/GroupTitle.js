import i18n from "@dhis2/d2-i18n";
import { Button } from "@dhis2/ui";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import PropTypes from "prop-types";
import React from "react";
import ErrorIcon from "../../../../../../../../../../../shared/icons/ErrorIcon";

export default function GroupTitle({
  setTitleEditOpen,
  title,
  errors,
  onDelete,
  id,
}) {
  return (
    <div className="row space-between align-items-center">
      <div className="row  align-items-center accordion-title-container">
        <div className="column w-auto">
          <p
            onDoubleClick={(event) => {
              event.stopPropagation();
              setTitleEditOpen(true);
            }}
            onClick={(event) => event.stopPropagation()}
            className="accordion-title group-name-area"
          >
            {title}
          </p>
          {errors && (
            <p style={{ fontSize: 12, margin: 4, color: "#f44336" }}>
              {errors}
            </p>
          )}
        </div>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            setTitleEditOpen(true);
          }}
          size="small"
          className="accordion-title-edit"
        >
          <EditIcon />
        </IconButton>
      </div>
      <div className>
        <div className="row align-items-center">
          <Button
            className="delete-group-icon"
            onClick={(_, event) => {
              event.stopPropagation();
              if (onDelete) {
                onDelete(id);
              }
            }}
            icon={<DeleteIcon />}
          >
            {i18n.t("Delete")}
          </Button>
          {errors && (
            <div style={{ paddingLeft: 16 }}>
              <ErrorIcon color={"#f44336"} size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

GroupTitle.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  setTitleEditOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  errors: PropTypes.any,
};
