const {useState} = React;
const formatCurrency = n => new Intl.NumberFormat('en-IL',{style:'currency',currency:'ILS'}).format(n);

function App(){
  const [tab,setTab]=useState('students');
  const students=[
    {id:1,name:'Joseph Cohen',balance:0},
    {id:2,name:'Miriam Levy',balance:50},
    {id:3,name:'Ahmad Ali',balance:-100}
  ];
  return React.createElement("div",null,
    React.createElement("div",{className:"tabs"},
      ["students","events"].map(k=>
        React.createElement("button",{key:k,onClick:()=>setTab(k),className:tab===k?"active":""},k)
      )
    ),
    tab==="students" && React.createElement("div",{className:"card"},
      students.map(s=>React.createElement("div",{key:s.id},
        s.name," — ",formatCurrency(s.balance)
      ))
    ),
    tab==="events" && React.createElement("div",{className:"card"},"Events placeholder")
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(React.createElement(App));