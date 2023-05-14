const mysql = require('mysql2');
const inquirer = require('inquirer')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'company_hr_db'
}, console.log("Connected to Company's HR Database")
)


connection.connect((err)=>{
  if (err) throw err;
  console.log('Connection established')
  start()
})

const endCon =()=>connection.destroy()

const start=()=>{inquirer.prompt([{
    type: 'list',
    name: 'start',
    message: 'Please select an action',
    choices:['show roles', 'show departments','show all employees', 'more options','quit']

}]).then((data)=>{
    switch (`${data.start}`){
    case 'show roles':
    roles()
    break;
    case 'show departments':
    department()
    break;
    case 'show all employees':
    employees()
    break;
    case 'more options':
    moreOptions()
    break;
    case 'quit':
    endCon()
    break;
    }
})
}

const department = ()=>{
connection.query('SELECT id AS dept_id, dept_name AS Department FROM departments', (err, results)=>{
    if (err) {
        throw err
    }
    console.table(results)
    start()

})
 }

 const roles = ()=>{
    connection.query('SELECT roles.id AS Role_id, departments.id AS Dept_ID,departments.dept_name AS Department,roles.title AS Designation,roles.salary AS Salary_in_$ FROM departments,roles WHERE roles.department_id = departments.id;', (err, results)=>{
        if (err) {
            throw err
        }
        console.table(results)
        start()
    })
     }

     const employees = ()=>{
        connection.query('SELECT employees.id AS ID,employees.first_name AS First_Name, employees.last_name AS LAST_NAME, roles.title AS DESIGNATION, departments.dept_name AS department, roles.salary AS Salary_in_$, Concat(manager.first_name," ", manager.last_name) AS Manager FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager ON employees.manager_id = manager.id', (err, results)=>{
            if (err) {
                throw err
            }
            console.table(results)
            start()
        })
         }

     const moreOptions =()=>{inquirer.prompt([{
        type:"list",
        name:"moreOptions",
        message: "What do you want to do?",
        choices:["add department","add role","add Employee","update Role","update Manager","quit" ]
     }]
     ).then((data)=>{
        switch (`${data.moreOptions}`){
        case "add department":
        addDepartment()
        break;
        case 'add role':
        addRole()
        break;
        case 'add Employee':
        addEmployee()
        break;
        case 'update Role':
        updateRole()
        break;
        case 'update Manager':
        updateManager()
        break;
        case 'quit':
        endCon()
        break;
        }
    
    })
    }

    const addDepartment =async ()=> {
        await inquirer.prompt([{
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?',
            
        }]).then((data)=>{
            connection.query(`INSERT INTO departments (dept_name) VALUES ('${data.department}');`)
        })
        start()
    }

    const addRole =async ()=> {
        await inquirer.prompt([{
            type: 'input',
            name: 'role',
            message: 'What is the name of the role?'
            
        },
    {
        type: 'input',
        name: 'dept',
        message: 'What is the name of the department?',
    },
{
    type:'input',
    name: 'salary',
    message:'How much is the salary for this role'
}]).then((data)=>{
            connection.query(`INSERT INTO roles (title, salary, department_id)
            VALUES ('${data.role}', ${data.salary}, (SELECT id FROM departments WHERE dept_name = '${data.dept}'))`)
        })
        start()
    }

//     
const addEmployee =async ()=> {
    await inquirer.prompt([{
        type: 'input',
        name: 'firstN',
        message: 'What is the first name of the employee?'
        
    },
{
    type: 'input',
    name: 'lastN',
    message: 'What is the Last name of the employee?',
},
{
type:'input',
name: 'role',
message:'What is the role title?'
},{
type: 'input',
name: 'firstN_m',
message: 'What is the first name of the manager?'

},
{
type: 'input',
name: 'lastN_m',
message: 'What is the Last name of the manager?',
}]).then((data)=>{
        connection.query(`CREATE TEMPORARY TABLE temp_manager_ids SELECT id FROM employees WHERE first_name = '${data.firstN_m}' AND last_name = '${data.lastN_m}'`)
        connection.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ('${data.firstN}', '${data.lastN}', (SELECT id FROM roles WHERE title = '${data.role}' LIMIT 1), (SELECT id FROM temp_manager_ids LIMIT 1))`)
        connection.query(`DROP TEMPORARY TABLE IF EXISTS temp_manager_ids;`)
    })
    start()
}
// Updating Manager
const updateManager =async ()=> {
    await inquirer.prompt([{
        type: 'input',
        name: 'firstN',
        message: 'What is the first name of the employee?'
        
    },
{
    type: 'input',
    name: 'lastN',
    message: 'What is the Last name of the employee?',
},
{
type: 'input',
name: 'firstN_m',
message: 'What is the first name of the manager?'

},
{
type: 'input',
name: 'lastN_m',
message: 'What is the Last name of the manager?',
}]).then((data)=>{
        connection.query(`CREATE TEMPORARY TABLE temp_manager_ids SELECT id FROM employees WHERE first_name = '${data.firstN_m}' AND last_name = '${data.lastN_m}'`)
        connection.query(`UPDATE employees SET manager_id = (SELECT id from temp_manager_ids LIMIT 1) WHERE first_name ='${data.firstN}' AND last_name = '${data.lastN}'`)
        connection.query(`DROP TEMPORARY TABLE IF EXISTS temp_manager_ids;`)
    })
    start()
}

// Updating employee role
const updateRole =async ()=> {
    await inquirer.prompt([{
        type: 'input',
        name: 'firstN',
        message: 'What is the first name of the employee?'
        
    },
{
    type: 'input',
    name: 'lastN',
    message: 'What is the Last name of the employee?',
},
{
type: 'input',
name: 'titleN',
message: 'New Title?'

},
{
type: 'input',
name: 'deptN',
message: 'New Department?',
}]).then((data)=>{
        connection.query(`UPDATE employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id SET roles.title = '${data.titleN}',departments.dept_name = '${data.deptN}' WHERE employees.first_name = '${data.firstN}' AND employees.last_name = '${data.lastN}'`)
    })
    start()
}

