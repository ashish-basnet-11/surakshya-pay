import { AppBar, ListGroup, ListRow, Screen, Section, SegmentedControl, Switch } from "@/components/ui";
import { Appearance, usePreferences } from "@/store/use-preferences-store";

export default function Preferences() {
  const { appearance, setAppearance, hideBalance, setHideBalance } = usePreferences();

  return (
    <Screen appBar={<AppBar title="Preferences" fallback="/account" />} width="narrow">
      <Section title="Appearance" description="System follows your device's light or dark setting.">
        <SegmentedControl<Appearance>
          accessibilityLabel="Appearance"
          value={appearance}
          onChange={setAppearance}
          options={[
            { value: "system", label: "System", icon: "phone-portrait-outline" },
            { value: "light", label: "Light", icon: "sunny-outline" },
            { value: "dark", label: "Dark", icon: "moon-outline" },
          ]}
        />
      </Section>
      <Section title="Privacy">
        <ListGroup>
          <ListRow
            icon="eye-off-outline"
            title="Hide balance by default"
            subtitle="Your balance stays masked until you tap to reveal it."
            trailing={<Switch value={hideBalance} onValueChange={setHideBalance} accessibilityLabel="Hide balance by default" />}
          />
        </ListGroup>
      </Section>
    </Screen>
  );
}
