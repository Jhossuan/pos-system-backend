import moment from "moment";

export class ToolsDate {

    static expireInOneHour = () => {
        return moment().add(1, 'hour').format()
    }

    static getNow = () => {
        return moment().format()
    }

}