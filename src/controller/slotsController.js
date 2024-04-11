const mongoose = require("mongoose");
const Slots = mongoose.model('Slots');
const {sendError} = require("../util/constants");
const {add} = require("nodemon/lib/rules"); //note: forget what use, keep it first
const serviceUtil = require("./serviceController");

async function getSlotsByDate(start_date, end_date, locker_id) {
    const sdate = new Date(start_date.split('T')[0]);
    const sdatePlusOne = new Date(start_date.split('T')[0]) + 1;
    const edate = new Date(start_date.split('T')[0]);
    const edatePlusOne = new Date(end_date.split('T')[0]) + 1;

    try {
        return await Slots.find({
            locker_id: locker_id,
            recordDate: {
                "$gte": sdate,
                "$lt": edatePlusOne
            }
        }).sort({recordDate: 1});
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function addSlot(locker_id, start_date, end_date, start_index, end_index, slot) {
    const sdate = new Date(start_date.split('T')[0]);
    const sdatePlusOne = new Date(start_date.split('T')[0]) + 1;
    const edate = new Date(start_date.split('T')[0]);
    const edatePlusOne = new Date(end_date.split('T')[0]) + 1;
    let computeDate = sdate;
    try {
        let slotsArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (slot.length === 0) {
            //no existing directly create
            if (sdate.getTime() === sdate.getTime()) {
                for (let i = start_index; i <= end_index; i++) {
                    slotsArr[i] = 1;
                }
                const slot = new Slots(
                    {
                        recordDate: setTimeToZero(start_date),
                        locker_id: locker_id,
                        slots: slotsArr
                    }
                );
                await slot.save();
            } else {
                while (computeDate.getTime() <= edate.getTime()) {
                    slotsArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    if (computeDate.getTime() === sdate.getTime()) {
                        for (let i = start_index; i <= 24; i++) {
                            slotsArr[i] = 1;
                        }
                        const slot = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await slot.save();
                    } else if (computeDate.getTime() === edate.getTime()) {
                        for (let i = 0; i <= end_index; i++) {
                            slotsArr[i] = 1;
                        }
                        const slot = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await slot.save();
                    } else {
                        slotsArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                        const slot = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await slot.save();
                    }
                    computeDate.setDate(computeDate.getDate() + 1);
                }
            }
        } else if (slot.length === 1) {
            //sdate = edate
            slotsArr = slot.slots;
            for (let i = start_index; i <= end_index; i++) {
                slotsArr[i] = 1;
            }
            slot.slots = slotsArr;
            await Slots.updateOne(slot);
        } else {
            //sdate != edate
            while (computeDate.getTime() <= edate.getTime()) {
                if (new Date(slot[0].recordDate.split('T')[0]).getTime() === sdate.getTime()) {
                    slotsArr = slot[0].slots;
                    for (let i = start_index; i <= 24; i++) {
                        slotsArr[i] = 1;
                    }
                    slot.slots = slotsArr;
                    await Slots.updateOne(slot[0]);
                } else if (new Date(slot[1].recordDate.split('T')[0]).getTime() === edate.getTime()) {
                    slotsArr = slot[1].slots;
                    for (let i = 0; i <= end_index; i++) {
                        slotsArr[i] = 1;
                    }
                    slot.slots = slotsArr;
                    await Slots.updateOne(slot[1]);
                } else {
                    slotsArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
                    const slot = new Slots(
                        {
                            recordDate: setTimeToZero(computeDate),
                            locker_id: locker_id,
                            slots: slotsArr
                        }
                    );
                    await slot.save();
                }
                computeDate.setDate(computeDate.getDate() + 1);
            }
        }
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function getSlotsByLockerId(locker_id) {
    try {
        return await Slots.find(
            {locker_id: locker_id}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

function setTimeToZero(date) {
    let result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

async function unsetSlot(locker_id, start_date, end_date, start_index, end_index, slot) {
    const sdate = new Date(start_date.split('T')[0]);
    const sdatePlusOne = new Date(start_date.split('T')[0]) + 1;
    const edate = new Date(start_date.split('T')[0]);
    const edatePlusOne = new Date(end_date.split('T')[0]) + 1;
    let computeDate = sdate;

    try {
        let slotsArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (slot.length === 1) {
            //sdate = edate
            slotsArr = slot.slots;
            for (let i = start_index; i <= end_index; i++) {
                slotsArr[i] = 0;
            }
            slot.slots = slotsArr;
            await Slots.updateOne(slot);
        } else {
            //sdate != edate
            for (let s of slot) {
                if (new Date(s.recordDate.split('T')[0]).getTime() === sdate.getTime()) {
                    slotsArr = s.slots;
                    for (let i = start_index; i <= 24; i++) {
                        slotsArr[i] = 0;
                    }
                    s.slots = slotsArr;
                    await Slots.updateOne(s);
                } else if (new Date(s.recordDate.split('T')[0]).getTime() === edate.getTime()) {
                    slotsArr = s.slots;
                    for (let i = 0; i <= end_index; i++) {
                        slotsArr[i] = 0;
                    }
                    s.slots = slotsArr;
                    await Slots.updateOne(s);
                } else {
                    slotsArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    s.slots = slotsArr;
                    await Slots.updateOne(s);
                }
            }
        }
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

async function deletePreviousRecord() {
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    try {
        await Slots.deleteMany(
            {recordDate: {
                    "$lt": currentDate
                }}
        );
    } catch (err) {
        console.log(err.message);
        sendError(err.message);
    }
}

module.exports = {
    getSlotsByDate,
    addSlot,
    getSlotsByLockerId,
    unsetSlot,
    deletePreviousRecord
}