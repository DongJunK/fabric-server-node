module.exports = (squelize, DataTypes)=>{
    return squelize.define('ticket_platform',{
        name:{
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true
        }, 
        contract_date:{
            type: DataTypes.DATE,
            allowNull: true
        },
        token:{
            type: DataTypes.STRING(50),
            allowNull: true
        }
    },{
        underscored: true
    });
};

// 발급처id, 이름, 계약일