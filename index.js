const { getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { findInReactTree } = require("powercord/util");
const { Plugin } = require("powercord/entities");
const Settings = require("./Settings");

module.exports = class CustomMessageLink extends Plugin {
    async startPlugin() {
        const module1 = await getModule(["copyId", "copyLink"]);
        const module2 = await getModule(["MenuItem"]);
        const copy = (await getModule(["copy"])).copy;
        const Routes = (await getModule(["Routes"])).Routes;
        const getSubdomain = () => this.settings.get("subdomain");

        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: "Custom Message Link",
            render: Settings
        });

        inject("custom-message-link1", module1, "copyLink", function (args, res) {
            const hostRaw = location.host.split(".");
            const host = (getSubdomain() ? (getSubdomain() + ".") : "") + hostRaw.splice(hostRaw.length - 2, 2).join(".");
            const [e, t] = args;
            copy(location.protocol + "//" + host
                + Routes.CHANNEL(e.guild_id, e.id, t.id));
        });

        inject("custom-message-link2", module2, "default", function (args) {
            const thatOne = findInReactTree(args[0], t => t.props && t.props.id == "copy-link");
            if (!thatOne) return args;
            if (thatOne.props.__action) return args;

            thatOne.props.__action = thatOne.props.action;
            thatOne.props.action = function (...args) {
                thatOne.props.__action.apply(this, args);
                setTimeout(() => {
                    const clipboard = require("electron").clipboard.readText();
                    console.info(clipboard);
                    if (!clipboard.match(/^https?:/)) return;
                    const protocol = clipboard.match(/^https?:/)[0];
                    const hostRaw = clipboard.match(/\/\/([a-zA-Z0-9.]+)\//)[1].split(".");
                    const host = (getSubdomain() ? (getSubdomain() + ".") : "") + hostRaw.splice(hostRaw.length - 2, 2).join(".");
                    const path = clipboard.match(/\/\/[a-zA-Z0-9.]+(\/.+)/)[1];
                    if (clipboard == (protocol + "//" + host + path)) return;
                    copy(protocol + "//" + host + path);
                }, 100);
            };
            return args;
        }, true);
    }

    pluginWillUnload() {
        uninject("custom-message-link1");
        uninject("custom-message-link2");
    }
};