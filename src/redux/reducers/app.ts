enum Action {
    
}

type Payload = {

}

type ActionT = {
    type: Action,
    payload: Payload
}

const initialState = {
    alert: false,
    clipboard: false,
    name: "sudoku",
    message: ""
};

export default function(state = initialState, action: ActionT) {

}