module.exports = (sequelize, DataTypes)=>{
    return sequelize.define('ticket_platform',{
        name:{
            type: DataTypes.STRING(40),
            allowNull: false,
            unique: true
        }, 
        contract_date:{
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        token:{
            type: DataTypes.STRING(100),
            allowNull: true
        }
    },{
        underscored: true,
        timestamps: false,
        freezeTableName: true,
        charset:'utf8',
        collate:'utf8_general_ci'
    });
};

// 발급처id, 이름, 계약일