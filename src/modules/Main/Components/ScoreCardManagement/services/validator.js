import i18n from "@dhis2/d2-i18n";
import { forIn, get, isEmpty } from "lodash";
import { REQUIRED_FIELDS } from "../../../../../core/constants/form";

function validateRequiredFields(scorecard, requiredFieldsPath = []) {
  const errors = {};
  forIn(scorecard, (value, key) => {
    if (requiredFieldsPath.includes(key) && isEmpty(get(scorecard, key))) {
      errors[`${key}`] = i18n.t("This field is required");
    }
  });
  return errors;
}

export function validateGroups(dataGroups = []) {
  const errors = {};
  for (const group of dataGroups) {
    if (isEmpty(group.dataHolders)) {
      errors[group.id] = i18n.t(
        "This group does not have any configured data sources"
      );
    }
  }
  return errors;
}

export default function validateScorecard(scorecard) {
  return (
    {
      ...validateRequiredFields(scorecard, REQUIRED_FIELDS),
      ...validateGroups(scorecard?.dataSelection?.dataGroups),
    } ?? {}
  );
}
