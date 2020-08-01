const { settings: { TextInput } } = require("powercord/components");
const { React } = require("powercord/webpack");

module.exports = class Settings extends React.Component {
    constructor(...args) {
        super(...args);
    }

    render() {
        const { getSetting, updateSetting } = this.props;

        return <>
            <TextInput
                placeholder="Поддомен"
                value={getSetting("subdomain", "jopa")}
                onChange={(v) => updateSetting("subdomain", v)}
            ></TextInput>
        </>;
    }
};