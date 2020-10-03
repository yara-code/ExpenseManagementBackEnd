/*
*  check time difference and adding time to dates
*
* */

const instance = {

    expiredCheck : (expiredDate ) => {
        let newDate = new Date(expiredDate);
        let currentDate = new Date();
        return currentDate > newDate;

    },
    addMinutes : (date, numberOfMinutes ) => {
        if (!date || date == undefined){
            date = new Date();
        }
        if(!numberOfMinutes || numberOfMinutes == undefined){
            numberOfMinutes = 0;
        }

        let newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() + numberOfMinutes);
        newDate = new Date(newDate);
        return newDate;

    },
    addHours : (date, numberOfHours ) => {
        if (!date || date == undefined){
            date = new Date();
        }
        if(!numberOfHours || numberOfHours == undefined){
            numberOfHours = 0;
        }
        let newDate = new Date(date);
        newDate.setHours(date.getHours() + numberOfHours);
        newDate = new Date(newDate);
        return newDate;
    },
};

module.exports = instance;