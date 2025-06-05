document.querySelectorAll('.btnChoose').forEach(button => {
    button.addEventListener('click', function () {
        document.getElementById('userType').value = this.dataset.user

        document.querySelectorAll('.btnChoose').forEach(btn => btn.classList.remove('selected'))

        this.classList.add('selected')
    })
})

document.getElementById('btnConfirm').addEventListener('click', function (ev) {

    ev.preventDefault()

    const userType = document.getElementById('userType').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const formulario = document.getElementById('loginInterface')
    if (userType && email && password) {
        formulario.submit()
    } else {
        alert('Por favor, selecione um tipo de usuário e preencha todos os campos corretamente.')
    }

    
    const buttons = document.querySelectorAll('.btnChoose');
 

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            userType.value = button.getAttribute('data-user');
        });
    });


    //     fetch('http://localhost:3000/interfaceUsuario', {
    //         method: 'POST',
    //         headers: null,
    //         body: JSON.stringify({
    //             userType: userType,
    //             email: email,
    //             password: password
    //         })
    //     })
    //     // .then(res => res.json())
    //     // .then(data => console.log(data))

})