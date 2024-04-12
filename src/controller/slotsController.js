const mongoose = require("mongoose");
const Slots = mongoose.model('Slots');
const {sendError} = require("../util/constants");
const {add} = require("nodemon/lib/rules"); //note: forget what use, keep it first
const serviceUtil = require("./serviceController");

const unsetArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const setArr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

async function getSlotsByDate(start_date, end_date, locker_id) {

    const sdate = new Date(start_date);
    let sdatePlusOne = new Date(sdate);
    sdatePlusOne.setDate(sdate.getDate() + 1);

    const edate = new Date(end_date);
    let edatePlusOne = new Date(edate);
    edatePlusOne.setDate(edate.getDate() + 1);

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
    const sdate = new Date(start_date);
    let sdatePlusOne = new Date(sdate);
    sdatePlusOne.setDate(sdate.getDate() + 1);

    const edate = new Date(end_date);
    let edatePlusOne = new Date(edate);
    edatePlusOne.setDate(edate.getDate() + 1);

    let computeDate = new Date(sdate);
    try {
        let slotsArr = [...unsetArr];
        if (slot.length === 0) {
            //no existing directly create
            if (sdate.getTime() === edate.getTime()) {
                for (let i = start_index; i <= end_index; i++) {
                    slotsArr[i] = 1;
                }
                const s = new Slots(
                    {
                        recordDate: setTimeToZero(start_date),
                        locker_id: locker_id,
                        slots: slotsArr
                    }
                );
                await s.save();
            } else {
                while (computeDate.getTime() <= edate.getTime()) {
                    slotsArr = [...unsetArr];
                    if (computeDate.getTime() === sdate.getTime()) {
                        for (let i = start_index; i <= 23; i++) {
                            slotsArr[i] = 1;
                        }
                        const s = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await s.save();
                    } else if (computeDate.getTime() === edate.getTime()) {
                        for (let i = 0; i <= end_index; i++) {
                            slotsArr[i] = 1;
                        }
                        const s = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await s.save();
                    } else {
                        slotsArr = [...setArr];
                        const s = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await s.save();
                    }
                    computeDate.setDate(computeDate.getDate() + 1);
                }
            }
        } else {
            const len = slot.length;
            let index = 0;
            let dateIndex = new Date(sdate);
            if (sdate.getTime() === edate.getTime()){
                //slot len will be 1
                for (let i = start_index; i <= end_index; i++) {
                    slot[index].slots[i] = 1;
                }
                await Slots.findOneAndUpdate({_id: slot[index]._id},
                    {slots:slot[index].slots});
            }
            else{
                while (dateIndex.getTime() <= edate.getTime() && index < len) {
                    if (dateIndex.getTime() !== new Date(slot[index].recordDate).getTime()) {
                        //create
                        if (dateIndex.getTime() === sdate.getTime()) {
                            slotsArr = [...unsetArr];
                            for (let i = start_index; i <= 23; i++) {
                                slotsArr[i] = 1;
                            }

                        } else if (dateIndex.getTime() === edate.getTime()) {
                            slotsArr = [...unsetArr];
                            for (let i = 0; i <= end_index; i++) {
                                slotsArr[i] = 1;
                            }
                        } else {
                            slotsArr = [...setArr];
                        }

                        const s = new Slots(
                            {
                                recordDate: setTimeToZero(computeDate),
                                locker_id: locker_id,
                                slots: slotsArr
                            }
                        );
                        await s.save();
                        dateIndex.setDate(dateIndex.getDate() + 1);
                        continue;
                    } else {
                        // existing slot, update
                        if (dateIndex.getTime() === sdate.getTime()) {
                            for (let i = start_index; i <= 23; i++) {
                                slot[index].slots[i] = 1;
                            }
                        } else if (dateIndex.getTime() === edate.getTime()) {
                            for (let i = 0; i <= end_index; i++) {
                                slot[index].slots[i] = 1;
                            }
                        } else {
                            slot[index].slots = [...setArr];
                        }
                        await Slots.findOneAndUpdate({_id: slot[index]._id},
                            {slots:slot[index].slots});
                        index++;
                    }
                    dateIndex.setDate(dateIndex.getDate() + 1);
                }
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
    const sdate = new Date(start_date);
    const sdatePlusOne = new Date(start_date) + 1;
    const edate = new Date(start_date);
    const edatePlusOne = new Date(end_date) + 1;
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
                    for (let i = start_index; i <= 23; i++) {
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
    currentDate.setHours(0, 0, 0, 0);
    try {
        await Slots.deleteMany(
            {
                recordDate: {
                    "$lt": currentDate
                }
            }
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