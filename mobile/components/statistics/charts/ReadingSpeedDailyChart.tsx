import React, {useMemo} from "react";
import {LineChart} from "react-native-gifted-charts";
import {Dimensions, StyleSheet} from "react-native";
import {View, XStack, YStack} from "tamagui";

import {CustomText} from "@/components/CustomText";
import i18n from "@/localization/i18n";
import {ReadingSpeedDailyStats} from "@/types/statistics/ReadingSpeedDailyStats";

type Props = {
    data: ReadingSpeedDailyStats[];
};

const {width: SCREEN_WIDTH} = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 150;

const ACCURACY_COLOR = "#3F8A5D";
const STRESS_ACCURACY_COLOR = "#9C4F86";
const WPM_COLOR = "#CB5A2E";

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}`;
};

const LegendRow = ({color, label}: { color: string; label: string }) => (
    <XStack alignItems="center" gap={8}>
        <YStack width={10} height={10} borderRadius={5} backgroundColor={color}/>
        <CustomText size="p3Regular" color="$gray-40">
            {label}
        </CustomText>
    </XStack>
);

const ReadingSpeedDailyChart: React.FC<Props> = ({data}) => {
    const {accuracyData, stressData, wpmData, hasStressData} = useMemo(() => {
        const maxWpm = Math.max(...data.map((d) => d.averageWpm), 1);
        const hasStressData = data.some((d) => d.averageStressAccuracy !== null);

        let lastStress = 0;
        const accuracyData: { value: number; label: string }[] = [];
        const stressData: { value: number; label: string }[] = [];
        const wpmData: { value: number; label: string; dataPointText: string }[] = [];

        for (const day of data) {
            const label = formatDate(day.date);
            accuracyData.push({value: Math.round(day.averageAccuracy * 100), label});

            if (day.averageStressAccuracy !== null) {
                lastStress = Math.round(day.averageStressAccuracy * 100);
            }
            stressData.push({value: lastStress, label});

            wpmData.push({
                value: Math.round((day.averageWpm / maxWpm) * 100),
                label,
                dataPointText: `${Math.round(day.averageWpm)}`,
            });
        }

        return {accuracyData, stressData, wpmData, hasStressData};
    }, [data]);

    if (data.length === 0) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical={40}>
                <CustomText size="p1Regular" color="$gray-40">
                    {i18n.t("reading_history_empty")}
                </CustomText>
            </YStack>
        );
    }

    return (
        <View style={styles.container}>
            <LineChart
                data={accuracyData}
                color={ACCURACY_COLOR}
                thickness={2}
                dataPointsColor1={ACCURACY_COLOR}
                data2={hasStressData ? stressData : wpmData}
                color2={hasStressData ? STRESS_ACCURACY_COLOR : WPM_COLOR}
                thickness2={2}
                dataPointsColor2={hasStressData ? STRESS_ACCURACY_COLOR : WPM_COLOR}
                data3={hasStressData ? wpmData : undefined}
                color3={WPM_COLOR}
                thickness3={2}
                dataPointsColor3={WPM_COLOR}
                width={CHART_WIDTH}
                height={220}
                spacing={CHART_WIDTH / Math.max(data.length, 4) / 1.5}
                initialSpacing={16}
                maxValue={100}
                noOfSections={5}
                curved
                hideDataPoints={data.length > 12}
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                xAxisColor="#E8DCC3"
                yAxisColor="#E8DCC3"
                rulesColor="#E8DCC3"
                rulesType="dashed"
                dashWidth={5}
                dashGap={5}
                isAnimated
                animationDuration={300}
            />
            <XStack flexWrap="wrap" gap={16} paddingTop={12} justifyContent="center">
                <LegendRow color={ACCURACY_COLOR} label={i18n.t("reading_speed_accuracy")}/>
                {hasStressData && (
                    <LegendRow color={STRESS_ACCURACY_COLOR} label={i18n.t("reading_speed_stress_accuracy")}/>
                )}
                <LegendRow color={WPM_COLOR} label={i18n.t("reading_speed_wpm")}/>
            </XStack>
            <CustomText size="p3Regular" color="$gray-40" textAlign="center" paddingTop={4}>
                {i18n.t("reading_speed_daily_wpm_note")}
            </CustomText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    axisText: {
        fontSize: 11,
        color: "#A68A63",
    },
});

export default React.memo(ReadingSpeedDailyChart);
