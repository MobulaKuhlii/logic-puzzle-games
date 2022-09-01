export function describe(message, tests, width = 30, indent = 1) {
    console.log("-".repeat(width));
    console.log("\t".repeat(indent) + message);
    console.log("-".repeat(width));
    tests();
}

export function it(message, test, showErrorMessages, indent = 1) {
    const outer = "\t".repeat(indent);
    const inner = "\t".repeat(indent + 1);
    console.log(`${outer}Test "${message}"`);
    const errMsgs = [];
    let resp = "pass";
    try {
        test();
    } catch(err) {
        errMsgs.push(err.message);
        resp = "fail";
    }
    console.log(inner + resp);
    if(showErrorMessages) {
        console.log(outer + "Error Messages: ");
        errMsgs.forEach(msg => {
            console.log(`${inner} '${msg}'`);
        });
        if(!errMsgs.length) {
            console.log(`${inner}none`);
        }
    }
}