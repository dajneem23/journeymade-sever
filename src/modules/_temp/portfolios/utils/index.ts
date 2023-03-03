import dayjs from "@/core/utils/dayjs";

export const toTimestamp = (val) => dayjs(val).unix();
