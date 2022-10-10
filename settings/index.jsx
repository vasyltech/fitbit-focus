const DefaultSettings = {
  duration: JSON.stringify({
    name: 30
  }),
  color: JSON.stringify("5080831"),
  reminder_frequency: JSON.stringify({
    values: [
      {
        name: "60 mins",
        value: "60"
      }
    ],
    selected: [
      3
    ]
  }),
  reminder_behavior: JSON.stringify({
    values: [
      {
        name: "Nudge 3 times",
        value: "trinity"
      }
    ],
    selected: [
      0
    ]
  })
}

function InitializeSettings(props) {
  for (let setting in DefaultSettings) {
    if (!props.settings[setting]) {
      props.settingsStorage.setItem(setting, DefaultSettings[setting]);
    }
  }
}

function SubmitGoal(props) {
  props.settingsStorage.setItem('set', (new Date()).getTime().toString());
}

registerSettingsPage((props) => {
  InitializeSettings(props);

  return (
    <Page>
      <Section
        title={
          <Text bold align="left">
            Clock Face Settings
          </Text>
        }
        description={
          <Text>
            Setup your Clock Face preferred look.
          </Text>
        }
      >
        <ColorSelect
          settingsKey="color"
          colors={[
            {color: 'blue', value: "5080831"},
            {color: 'violet', value: "8421631"},
            {color: 'green', value: "2930036"},
            {color: 'magenta', value: "15803516"},
            {color: 'orange', value: "16741677"},
            {color: 'purple', value: "12998907"},
            {color: 'red', value: "16403809"}
          ]}
        />
      </Section>

      <Section
        title={
          <Text bold align="left">
            Focus Settings
          </Text>
        }
        description={
          <Text>
            Inspiration comes from the audio record "The Strangest Secret" (1956) by Earl Nightingale, which teaches that periodically reminding yourself about the desired goal for some time (e. g. 30 days), will yield a desired outcome. Set your goal duration, how often you want a reminder, and choose a unique vibration pattern. Then be disciplined enough to spend a few quality seconds truly feeling as if your goal already came true when a reminder goes off.
          </Text>
        }
      >
        <TextInput
          label="Focus Duration (days)"
          settingsKey="duration"
          type="number"
        />

        <Select
          label="Reminder Frequency"
          settingsKey="reminder_frequency"
          options={[
            { name: "15 mins", value: "15" },
            { name: "30 mins", value: "30" },
            { name: "45 mins", value: "45" },
            { name: "60 mins", value: "60" },
            { name: "90 mins", value: "90" },
            { name: "2 hours", value: "120" },
            { name: "3 hours", value: "180" }
          ]}
        />

        <Select
          label="Reminder Behavior"
          settingsKey="reminder_behavior"
          options={[
            { name: "Nudge 3 times", value: "trinity" },
            { name: "Nudge 2 times", value: "double" },
            { name: "Ring", value: "ring" },
            { name: "Bump", value: "bump" },
            { name: "Ping", value: "ping" }
          ]}
        />
      </Section>

      <Button
        label="Set The Goal"
        onClick={ () => SubmitGoal(props) }
      />

      {
        props.settingsStorage.getItem("is_error") === "1" ?
          <Text align="left">There was an error communicating with your device. Please make sure that your device is connected with the phone and try again. If no luck, as a possible solution, try to restart the Fitbit app.</Text>
          :
          null
      }
    </Page>
  );
});
